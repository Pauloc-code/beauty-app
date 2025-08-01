import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { SystemSettings } from '@shared/schema';

export class TimezoneService {
  private timezone: string;
  private workingHours: { start: string; end: string };
  private workingDays: number[];

  constructor(settings: SystemSettings) {
    this.timezone = settings.timezone;
    this.workingHours = settings.workingHours as { start: string; end: string };
    this.workingDays = settings.workingDays as number[];
  }

  /**
   * Converte uma data UTC para o fuso horário local configurado
   */
  toLocalTime(utcDate: Date): Date {
    return toZonedTime(utcDate, this.timezone);
  }

  /**
   * Converte uma data do fuso horário local para UTC
   */
  toUTC(localDate: Date): Date {
    return fromZonedTime(localDate, this.timezone);
  }

  /**
   * Verifica se uma data/hora está dentro do horário de funcionamento
   */
  isWithinWorkingHours(date: Date): boolean {
    const localDate = this.toLocalTime(date);
    const dayOfWeek = localDate.getDay();
    
    // Verificar se é um dia de trabalho
    if (!this.workingDays.includes(dayOfWeek)) {
      return false;
    }

    // Verificar horário
    const timeStr = format(localDate, 'HH:mm');
    return timeStr >= this.workingHours.start && timeStr <= this.workingHours.end;
  }

  /**
   * Verifica se duas datas são do mesmo dia no fuso local
   */
  isSameLocalDay(date1: Date, date2: Date): boolean {
    const local1 = this.toLocalTime(date1);
    const local2 = this.toLocalTime(date2);
    
    return (
      local1.getDate() === local2.getDate() &&
      local1.getMonth() === local2.getMonth() &&
      local1.getFullYear() === local2.getFullYear()
    );
  }

  /**
   * Obtém o início e fim do dia local em UTC
   */
  getLocalDayBounds(date: Date): { start: Date; end: Date } {
    const localDate = this.toLocalTime(date);
    
    // Início do dia no fuso local
    const startOfDay = new Date(localDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Fim do dia no fuso local
    const endOfDay = new Date(localDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return {
      start: this.toUTC(startOfDay),
      end: this.toUTC(endOfDay)
    };
  }

  /**
   * Formatar data no fuso horário local
   */
  formatLocal(date: Date, formatStr: string): string {
    return format(this.toLocalTime(date), formatStr);
  }

  /**
   * Validar se um agendamento pode ser criado no horário solicitado
   */
  validateAppointmentTime(date: Date): { valid: boolean; message?: string } {
    const localDate = this.toLocalTime(date);
    const dayOfWeek = localDate.getDay();
    
    // Verificar se é um dia de trabalho
    if (!this.workingDays.includes(dayOfWeek)) {
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      return {
        valid: false,
        message: `${dayNames[dayOfWeek]} não é um dia de funcionamento`
      };
    }

    // Verificar horário
    const timeStr = format(localDate, 'HH:mm');
    if (timeStr < this.workingHours.start || timeStr > this.workingHours.end) {
      return {
        valid: false,
        message: `Horário fora do funcionamento (${this.workingHours.start} às ${this.workingHours.end})`
      };
    }

    return { valid: true };
  }
}

/**
 * Função utilitária para criar uma instância do TimezoneService
 */
export async function createTimezoneService(storage: any): Promise<TimezoneService> {
  const settings = await storage.getSystemSettings();
  return new TimezoneService(settings);
}