declare module 'html2pdf.js' {
  function html2pdf(): html2pdf.Worker;
  
  namespace html2pdf {
    interface Options {
      margin?: number | [number, number, number, number];
      filename?: string;
      image?: {
        type?: string;
        quality?: number;
      };
      html2canvas?: {
        scale?: number;
        useCORS?: boolean;
        [key: string]: any;
      };
      jsPDF?: {
        unit?: string;
        format?: string | [number, number];
        orientation?: 'portrait' | 'landscape';
        [key: string]: any;
      };
      [key: string]: any;
    }
    
    class Worker {
      from(source: HTMLElement | string): Worker;
      to(target: any): Worker;
      set(options: Options): Worker;
      save(): Worker;
      outputPdf(type: string): Promise<any>;
      output(type: string, options?: any): Promise<any>;
      then(callback: (worker: Worker) => void): Worker;
      catch(callback: (error: Error) => void): Worker;
    }
  }
  
  export default html2pdf;
}
