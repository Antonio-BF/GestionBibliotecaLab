namespace GestionBibliotecaLab.Infraestructura.Jobs
{
    public class RefreshTokenCleanupOptions
    {
        public int DiasRetencion { get; set; } = 30;
        public double IntervaloHoras { get; set; } = 24;
    }
}
