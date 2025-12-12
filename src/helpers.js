export function objectsEqual(o1, o2) {
    if (o1 == null || o2 == null) {
        return o1 === o2
    }
    if (Array.isArray(o1) && Array.isArray(o2)) {
        return arraysEqual(o1, o2)
    }
    if (typeof o1 === 'object' && typeof o2 === 'object') {
        const keys1 = Object.keys(o1)
        const keys2 = Object.keys(o2)
        
        if (keys1.length !== keys2.length) {
            return false
        }
        for (const key of keys1) {
            if (!keys2.includes(key)) {
                return false
            }
            if (!objectsEqual(o1[key], o2[key])) {
                return false
            }
        }
        return true
    }
    return o1 === o2
}

export function arraysEqual(a1, a2) {
    if (!Array.isArray(a1) || !Array.isArray(a2)) {
        return false
    }
    if (a1.length !== a2.length) {
        return false
    }
    return a1.every((item, index) => objectsEqual(item, a2[index]))
}
