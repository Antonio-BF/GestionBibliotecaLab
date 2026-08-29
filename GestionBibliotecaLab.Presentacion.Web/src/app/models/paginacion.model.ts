export interface PaginacionResultado<T> {
  items: T[];
  pagina: number;
  tamanioPagina: number;
  totalRegistros: number;
  totalPaginas: number;
}