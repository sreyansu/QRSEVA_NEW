// Utility Functions
export const formatDate = (date: Date): string => {
    return date.toISOString();
};

export const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount / 100); // Amount in paisa
};
