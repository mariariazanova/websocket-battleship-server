export const generateUuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
        const r: number = (Math.random() * 16) | 0;
        const v: number = c === 'x' ? r : (r & 0x3) | 0x8;

        return v.toString(16);
    });
}

export const generateUniqueId = (): number => {
    const length = 6;
    const digits = Array.from({ length: 10 }, (_, i) => i);
    let uniqueId = '';

    while (uniqueId.length < length) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        uniqueId += digits[randomIndex].toString();
        digits.splice(randomIndex, 1); // Remove the used digit to avoid repetition
    }

    return Number(uniqueId);
}

let currentId = 0;

export const generateId = (): number => {
    return ++currentId;
}
