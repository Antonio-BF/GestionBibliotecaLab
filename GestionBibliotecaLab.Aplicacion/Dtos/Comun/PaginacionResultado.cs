namespace GestionBibliotecaLab.Aplicacion.Dtos.Comun
{
    public class PaginacionResultado<T>
    {
        public List<T> Items { get; set; } = new();
        public int Pagina { get; set; }
        public int TamanioPagina { get; set; }
        public int TotalRegistros { get; set; }
        public int TotalPaginas => TamanioPagina == 0 ? 0 : (int)Math.Ceiling(TotalRegistros / (double)TamanioPagina);
    }
}
