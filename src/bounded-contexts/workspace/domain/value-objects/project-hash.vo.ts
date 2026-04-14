import { randomBytes } from 'node:crypto';

export class ProjectHash {
    private static readonly HASH_LENGTH = 12;
    private static readonly HASH_REGEX = /^[a-f0-9]{12}$/;

    private constructor(private readonly value: string) {}

    static generate(): ProjectHash {
        return new ProjectHash(randomBytes(6).toString('hex'));
    }

    static from(value: string): ProjectHash {
        if (!ProjectHash.HASH_REGEX.test(value)) {
            throw new Error(
                `Project hash must be ${ProjectHash.HASH_LENGTH}-char lowercase hex string`,
            );
        }

        return new ProjectHash(value);
    }

    toString(): string {
        return this.value;
    }
}
