'use strict';

const positions = ['start', 'center', 'end'];

function createDirections(dirs: string[]): string[] {
    const directions: string[] = [];
    dirs.forEach(dir => positions.forEach(pos => directions.push(`${dir}-${pos}`)));
    return directions;
}

export { createDirections };
