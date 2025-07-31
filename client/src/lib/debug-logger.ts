// Sistema centralizado de logs para debug e monitoramento
export class DebugLogger {
  private static isDevelopment = import.meta.env.DEV;
  
  static log(module: string, action: string, data?: any) {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${module}] ${action}`, data ? data : '');
    }
  }
  
  static error(module: string, action: string, error: any) {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] [${module}] ERROR: ${action}`, error);
    }
  }
  
  static success(module: string, action: string, data?: any) {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [${module}] ✅ ${action}`, data ? data : '');
    }
  }
  
  static warn(module: string, action: string, data?: any) {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      console.warn(`[${timestamp}] [${module}] ⚠️ ${action}`, data ? data : '');
    }
  }
}