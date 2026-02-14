import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK once
admin.initializeApp();

// Authentication
export { bootstrapSalesAdmin } from './auth/bootstrap';

// Sales Logic
export { createRestaurant } from './sales/createRestaurant';
export { activateSubscription } from './sales/activateSubscription';
