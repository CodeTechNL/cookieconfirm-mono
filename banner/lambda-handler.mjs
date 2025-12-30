import { execFileSync } from "node:child_process";

export const handler = async (event) => {
    // Custom Resource calls: Create/Update/Delete
    if (event?.RequestType === "Delete") {
        return { PhysicalResourceId: event.PhysicalResourceId || "noop-delete" };
    }

    execFileSync("/entrypoint.sh", { stdio: "inherit" });

    return { PhysicalResourceId: "one-shot-lambda-docker" };
};
