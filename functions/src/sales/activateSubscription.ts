import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { requireSalesRole } from '../middleware/auth';

const PLAN_CONFIG = {
    LITE: { price: 79900, name: 'LITE' },
    PRIME: { price: 129900, name: 'PRIME' },
    SUPER: { price: 199900, name: 'SUPER' },
};

// Calculate end date based on duration (months)
const addMonths = (date: Date, months: number): Date => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

// Add days to a date
const addDays = (date: Date, days: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

export const activateSubscription = functions.https.onCall(async (data, context) => {
    // 1. Verify Role
    requireSalesRole(context);

    const { restaurantId, plan, duration, paymentMethod, paymentReference } = data;

    if (!restaurantId || !plan || !duration || !paymentMethod) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    // @ts-ignore
    const planDetails = PLAN_CONFIG[plan];
    if (!planDetails) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid plan selected.');
    }

    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const startDate = now.toDate();
    const endDate = addMonths(startDate, duration);
    const gracePeriodEnd = addDays(endDate, 3);

    try {
        const batch = db.batch();

        // 2. Create Subscription Record
        const subRef = db.collection('subscriptions').doc();
        const subData = {
            id: subRef.id,
            restaurantId,
            plan,
            status: 'ACTIVE',
            startDate: now,
            endDate: admin.firestore.Timestamp.fromDate(endDate),
            gracePeriodEnd: admin.firestore.Timestamp.fromDate(gracePeriodEnd),
            duration,
            amount: planDetails.price * duration, // Simple calculation for now
            paymentMethod,
            paymentReference,
            activatedBy: context.auth!.uid,
            activatedAt: now,
            createdAt: now,
            updatedAt: now,
        };
        batch.set(subRef, subData);

        // 3. Update Restaurant Status
        const restaurantRef = db.collection('restaurants').doc(restaurantId);
        batch.update(restaurantRef, {
            isActive: true,
            subscriptionId: subRef.id,
            currentPlan: plan,
            updatedAt: now,
            // Update plan features based on selected plan (simplified logic)
            'planFeatures.kds': plan !== 'LITE',
            'planFeatures.reports': plan !== 'LITE',
            'planFeatures.dineIn': plan === 'SUPER',
        });

        // 4. Create Payment Record
        const paymentRef = db.collection('payments').doc();
        batch.set(paymentRef, {
            id: paymentRef.id,
            restaurantId,
            subscriptionId: subRef.id,
            amount: planDetails.price * duration,
            type: 'SUBSCRIPTION',
            method: paymentMethod,
            reference: paymentReference,
            status: 'CONFIRMED', // Assumed confirmed if activating manually
            recordedBy: context.auth!.uid,
            createdAt: now
        });

        await batch.commit();

        return { success: true, subscriptionId: subRef.id };

    } catch (error) {
        throw new functions.https.HttpsError('internal', (error as Error).message);
    }
});
