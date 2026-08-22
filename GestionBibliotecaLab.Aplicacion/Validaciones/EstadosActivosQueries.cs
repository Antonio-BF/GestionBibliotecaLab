using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.Validaciones
{
    internal static class EstadosActivosQueries
    {
        public static Task<bool> UsuarioTienePenalizacionesPendientesAsync(AppDbContext context, int usuarioId) =>
            context.Penalizaciones.AnyAsync(p =>
                p.UsuarioId == usuarioId && p.Estado == EstadoPenalizacion.Pendiente.ToString());

        public static Task<bool> UsuarioTienePrestamosActivosAsync(AppDbContext context, int usuarioId) =>
            context.Prestamos.AnyAsync(p =>
                p.UsuarioId == usuarioId && p.Estado != EstadoPrestamo.Devuelto.ToString());

        public static Task<int> ContarPrestamosActivosAsync(AppDbContext context, int usuarioId) =>
            context.Prestamos.CountAsync(p =>
                p.UsuarioId == usuarioId && p.Estado != EstadoPrestamo.Devuelto.ToString());

        public static Task<bool> UsuarioTienePrestamoActivoDeLibroAsync(AppDbContext context, int usuarioId, int libroId) =>
            context.Prestamos.AnyAsync(p =>
                p.UsuarioId == usuarioId && p.LibroId == libroId && p.Estado != EstadoPrestamo.Devuelto.ToString());

        public static Task<bool> UsuarioTieneReservasActivasAsync(AppDbContext context, int usuarioId) =>
            context.ReservasLabs.AnyAsync(r =>
                r.UsuarioId == usuarioId &&
                (r.Estado == EstadoReserva.Pendiente.ToString() || r.Estado == EstadoReserva.Confirmada.ToString()));

        public static Task<bool> LibroTienePrestamosActivosAsync(AppDbContext context, int libroId) =>
            context.Prestamos.AnyAsync(p =>
                p.LibroId == libroId && p.Estado != EstadoPrestamo.Devuelto.ToString());

        public static Task<bool> LaboratorioTieneReservasActivasAsync(AppDbContext context, int laboratorioId) =>
            context.ReservasLabs.AnyAsync(r =>
                r.LaboratorioId == laboratorioId &&
                (r.Estado == EstadoReserva.Pendiente.ToString() || r.Estado == EstadoReserva.Confirmada.ToString()));
    }
}
