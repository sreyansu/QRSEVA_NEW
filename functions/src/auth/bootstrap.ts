import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// This is an HTTP function (not Callable) to be called via CURL or browser for initial setup
// Secure this with a secret token or key in production if left deployed
// For now, we'll check for a hardcoded secret in query params
export const bootstrapSalesAdmin = functions.https.onRequest(async (req, res) => {
    const secret = req.query.secret;

    // Simple protection for the bootstrap endpoint
    if (secret !== 'socketix-bootstrap-secret') {
        res.status(403).send('Forbidden');
        return;
    }

    const email = 'qrsevatechnologiespvtltd@gmail.com';
    const password = 'QRseva@1001'; // Initial password

    try {
        // 1. Check if user exists
        let userRecord: admin.auth.UserRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            functions.logger.info(`User ${email} already exists. Updating claims...`);
        } catch (e) {
            // Create user
            functions.logger.info(`Creating user ${email}...`);
            userRecord = await admin.auth().createUser({
                email,
                password,
                emailVerified: true,
                displayName: 'Super Admin',
            });
        }

        // 2. Set Custom Claims
        await admin.auth().setCustomUserClaims(userRecord.uid, {
            role: 'SALES_ADMIN',
        });

        // 3. Create/Update User Document in Firestore
        await admin.firestore().collection('sales_users').doc(userRecord.uid).set({
            id: userRecord.uid,
            email,
            name: 'Super Admin',
            role: 'SALES_ADMIN',
            isActive: true,
            mustChangePassword: true, // Force change on first login
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        res.status(200).send({
            success: true,
            message: `Sales Admin bootstrapped: ${email}`,
            uid: userRecord.uid
        });
    } catch (error) {
        functions.logger.error(error);
        res.status(500).send({ error: (error as Error).message });
    }
});
