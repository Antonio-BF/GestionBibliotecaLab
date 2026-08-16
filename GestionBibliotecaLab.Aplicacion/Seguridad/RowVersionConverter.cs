using GestionBibliotecaLab.Aplicacion.Excepciones;

namespace GestionBibliotecaLab.Aplicacion.Seguridad
{
    internal static class RowVersionConverter
    {
        public static string ToBase64(byte[] rowVersion) => Convert.ToBase64String(rowVersion);

        public static byte[] FromBase64(string rowVersion)
        {
            try
            {
                return Convert.FromBase64String(rowVersion);
            }
            catch (FormatException)
            {
                throw new ValidationException("El RowVersion enviado no tiene un formato válido.");
            }
        }
    }
}
