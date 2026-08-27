namespace GestionBibliotecaLab.Aplicacion.Dtos.Comun
{
    public abstract class FiltroPaginadoBase
    {
        public const int TamanioPaginaPorDefecto = 20;
        public const int TamanioPaginaMaximo = 100;

        private int _pagina = 1;
        private int _tamanioPagina = TamanioPaginaPorDefecto;

        public int Pagina
        {
            get => _pagina;
            set => _pagina = value < 1 ? 1 : value;
        }

        public int TamanioPagina
        {
            get => _tamanioPagina;
            set => _tamanioPagina = value switch
            {
                < 1 => TamanioPaginaPorDefecto,
                > TamanioPaginaMaximo => TamanioPaginaMaximo,
                _ => value
            };
        }
    }
}
