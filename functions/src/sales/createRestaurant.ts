import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { requireSalesRole } from '../middleware/auth';
import { generateSlug } from '../utils/slug';

export const createRestaurant = functions.https.onCall(async (data, context) => {
    // 1. Verify Authentication & Role
    requireSalesRole(context);

    const { name, phone, email, address, adminPassword } = data;

    // Basic validation
    if (!name || !email || !adminPassword) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }

    const db = admin.firestore();
    const auth = admin.auth();

    try {
        // 2. Create Restaurant Admin User in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password: adminPassword,
            emailVerified: true, // Assume verified since sales team creates it
            displayName: `${name} Admin`,
        });

        // 3. Generate Slug & ID
        let slug = generateSlug(name);
        // TODO: Check for slug uniqueness and append counter if needed

        const restaurantRef = db.collection('restaurants').doc();
        const restaurantId = restaurantRef.id;

        // 4. Create Restaurant Document
        await restaurantRef.set({
            id: restaurantId,
            name,
            slug,
            phone,
            email,
            address,
            isActive: false, // Inactive until subscription is added
            subscriptionId: null,
            currentPlan: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: context.auth!.uid,
            planFeatures: {
                kds: false,
                dineIn: false,
                onlinePayment: false,
                reports: false,
                maxMenuItems: 50
            },
            settings: {
                deliveryCharge: 0,
                minimumOrderAmount: 0,
                orderTypes: { takeaway: true, delivery: false, dineIn: false },
                paymentModes: { cash: true, upi: true, online: false },
                operatingHours: { open: "09:00", close: "22:00", timezone: "Asia/Kolkata", closedDays: [] },
                autoAcceptOrders: false
            }
        });

        // 5. Set Custom Claims for the new Admin
        await auth.setCustomUserClaims(userRecord.uid, {
            role: 'RESTAURANT_ADMIN',
            restaurantId: restaurantId,
        });

        // 6. Log Audit (Optional for now, but good practice)
        // await logAudit(...)

        return {
            success: true,
            restaurantId,
            slug,
            adminUid: userRecord.uid
        };

    } catch (error) {
        throw new functions.https.HttpsError('internal', (error as Error).message);
    }
});
