import { WindowType, FilterType, AnalogToDigitalTransformationDesignMethod } from '../enums';
import { lowPassImpulseResponse, bandpassImpulseResponse } from './impulseResponse';
import { elementWiseAdd, elementWiseMultiply, H_of_s } from '../utils';
import { Hamming, Han, Bartlett } from './window';
import { getCausalButterworthPoles, getChebyshevIPoles } from './analog';
import { bilinearTransform } from '../transforms';

export const WindowingMethodDesign = (
    filterType: FilterType,
    windowType: WindowType,
    N: number,
    w1: number,
    w2: number
    ) => {

        let x = [];
        switch (windowType) {
            case WindowType.RECTANGULAR:
                x = getImpulseResponse(w1, w2, N, filterType);
                break;
            case WindowType.BARTLETT:
                x = elementWiseMultiply(getImpulseResponse(w1, w2, N, filterType), Bartlett(N));
                break;
            case WindowType.HAMMING:
                x = elementWiseMultiply(getImpulseResponse(w1, w2, N, filterType), Hamming(N));
                break;
            case WindowType.HAN:
                x = elementWiseMultiply(getImpulseResponse(w1, w2, N, filterType), Han(N));
                break;
        }
    return { num: x, den: [1] };
}

export const AnalogToDigitalTransformationDesign = (
    method: AnalogToDigitalTransformationDesignMethod,
    filterType: FilterType,
    N: number,
    w1: number,
    w2: number,
    chebyshevEpsilonFactor: number = 0.5
    ) => {
        // Steps:
        // 1. Convert the discrete freq. to cont. freq. via the formula: Omega = 2*tan(w/2)
        // 2. Design an analog filter
        // 3. Convert the analog filter to digital filter (bilinear transform)
        const Omega_c = 2 * Math.tan(w1 / 2);
        var poles;
        switch(method) {
            case AnalogToDigitalTransformationDesignMethod.BUTTERWORTH:
                poles = getCausalButterworthPoles(N, Omega_c);
                break;
            case AnalogToDigitalTransformationDesignMethod.CHEBYSHEV:
                poles = getChebyshevIPoles(N, Omega_c, chebyshevEpsilonFactor);
                break;
        }

        const h_of_s = H_of_s(poles, Omega_c, filterType);
        const h_of_z = bilinearTransform(h_of_s);
    return h_of_z;
}


const getImpulseResponse = (
    w1: number,
    w2: number, 
    N: number,
    filterType: FilterType) => {
    switch (filterType) {
        case FilterType.LOWPASS:
            return lowPassImpulseResponse(w1, N);
        case FilterType.HIGHPASS:
            return bandpassImpulseResponse(w1, Math.PI, N);
        case FilterType.BANDPASS:
            return bandpassImpulseResponse(w1, w2, N);
        case FilterType.BANDSTOP:
            return elementWiseAdd(bandpassImpulseResponse(Math.PI, w2, N), 
                                  lowPassImpulseResponse(w1, N));
    }
}