
// n = 0 => \omega_c / \pi
// n \neq 0 => frac{\sin{omega_c n}}{n\pi}
export const lowPassImpulseResponse = (cutOffFreq: number, M: number) => {
    const array = [];
    const mid = (M - 1) / 2;
    for (let i = 0; i < M; i++) {
        const n = i - mid; 
        if (Math.abs(n) < 0.0001) { 
            array.push(cutOffFreq / Math.PI);
        } else {
            array.push(Math.sin(cutOffFreq * n) / (Math.PI * n));
        }
    }

    return array;
};

export const bandpassImpulseResponse = (w1: number, w2: number, N: number = 1024) => {
    let array = new Array(N).fill(0);
    const mid = Math.floor(N / 2); // Math.floor() is necessary to make it work for both odd and even Ns

    for (let i = 0; i < N; i++) {
        const k = i - mid;
        if (k == 0) {
            array[i] = (w2 - w1) / Math.PI;
        } else {
            array[i] = (Math.sin(w2 * k) - Math.sin(w1 * k)) / (Math.PI * k);
        }
    }

    return array;
};

