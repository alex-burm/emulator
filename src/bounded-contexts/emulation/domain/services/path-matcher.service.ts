import { Injectable } from '@nestjs/common';

export type PathMatchResult = {
    params: Record<string, string>;
};

@Injectable()
export class PathMatcherService {
    match(pattern: string, actualPath: string): PathMatchResult | null {
        const patternSegments = this.normalize(pattern);
        const actualSegments = this.normalize(actualPath);

        if (patternSegments.length !== actualSegments.length) {
            return null;
        }

        const params: Record<string, string> = {};

        for (let i = 0; i < patternSegments.length; i += 1) {
            const patternSegment = patternSegments[i];
            const actualSegment = actualSegments[i];

            if (patternSegment.startsWith(':')) {
                const paramName = patternSegment.slice(1);

                if (!paramName) {
                    return null;
                }

                params[paramName] = actualSegment;
                continue;
            }

            if (patternSegment !== actualSegment) {
                return null;
            }
        }

        return { params };
    }

    private normalize(path: string): string[] {
        return path
            .split('/')
            .map((segment) => segment.trim())
            .filter((segment) => segment.length > 0);
    }
}
