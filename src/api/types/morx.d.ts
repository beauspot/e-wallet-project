declare module "morx" {
    interface Spec {
        build(field: string, rule: string): Spec;
        end(): Spec;
    }
    export function spec(): Spec;
    export function validate(data: any, spec: Spec, options?: { throw_error: boolean }): { params: any };
}
