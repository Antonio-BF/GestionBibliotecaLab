namespace GestionBibliotecaLab.Aplicacion.Excepciones
{
    public abstract class ExcepcionAplicacionBase : Exception
    {
        public int StatusCode { get; }

        protected ExcepcionAplicacionBase(string mensaje, int statusCode) : base(mensaje)
        {
            StatusCode = statusCode;
        }
    }
}
