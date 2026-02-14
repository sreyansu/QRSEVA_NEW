import * as functions from 'firebase-functions';

// Interface for Custom Claims
export interface CustomClaims {
    role: 'SALES_ADMIN' | 'SALES_USER' | 'RESTAURANT_ADMIN';
    restaurantId?: string;
}

export const requireAuth = (context: functions.https.CallableContext) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'The function must be called while authenticated.'
        );
    }
    return context.auth;
};

export const requireRole = (context: functions.https.CallableContext, allowedRoles: string[]) => {
    const auth = requireAuth(context);
    const token = auth.token;

    if (!allowedRoles.includes(token.role)) {
        throw new functions.https.HttpsError(
            'permission-denied',
            `User does not have permission. Required one of: ${allowedRoles.join(', ')}`
        );
    }
    return token;
};

export const requireSalesAdmin = (context: functions.https.CallableContext) => {
    return requireRole(context, ['SALES_ADMIN']);
};

export const requireSalesRole = (context: functions.https.CallableContext) => {
    return requireRole(context, ['SALES_ADMIN', 'SALES_USER']);
};

export const requireRestaurantAdmin = (context: functions.https.CallableContext) => {
    return requireRole(context, ['RESTAURANT_ADMIN']);
};
