import { auth } from "@/auth";

export async function withActionError<T>(
  actionName: string,
  errorMessage: string,
  fn: () => Promise<T>
): Promise<T | { success: false; error: string }> {
  try {
    return await fn();
  } catch (error) {
    console.error(`Error ${actionName}:`, error);
    return { success: false, error: errorMessage };
  }
}

export async function withAdminActionError<T>(
  actionName: string,
  errorMessage: string,
  fn: () => Promise<T>
): Promise<T | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user) {
      console.warn(`Unauthorized action attempt: ${actionName}`);
      return { success: false, error: "Unauthorized access" };
    }
    return await fn();
  } catch (error) {
    console.error(`Error ${actionName}:`, error);
    return { success: false, error: errorMessage };
  }
}

