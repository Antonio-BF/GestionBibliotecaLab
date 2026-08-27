using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.Validaciones
{
    internal static class PenalizacionReglasValidacion
    {
        public static void ValidarCombinacionOrigenTipo(OrigenPenalizacion origen, TipoPenalizacion tipo)
        {
            var esValida = (origen, tipo) switch
            {
                (OrigenPenalizacion.Prestamo, TipoPenalizacion.DevolucionTardia) => true,
                (OrigenPenalizacion.Prestamo, TipoPenalizacion.Otro) => true,
                (OrigenPenalizacion.ReservaLab, TipoPenalizacion.DanioEquipo) => true,
                (OrigenPenalizacion.ReservaLab, TipoPenalizacion.Otro) => true,
                _ => false
            };

            if (!esValida)
                throw new ValidationException($"El tipo '{tipo}' no es válido para el origen '{origen}'.");
        }

        public static async Task<Prestamo> ObtenerPrestamoParaPenalizarAsync(AppDbContext context, int prestamoId) {
           
            var prestamo = await context.Prestamos.Include(p => p.Usuario).FirstOrDefaultAsync(p => p.Id == prestamoId)
                ?? throw new ResourceNotFoundException($"No se encontró el préstamo con el id {prestamoId}");

            if (prestamo.Estado == EstadoPrestamo.Prestado.ToString())
                throw new ConflictException("Solo se puede registrar una penalizacion sobre prestamos Devuelto o EnMora");

            return prestamo;
        }
        

        public static async Task<ReservaLab> ObtenerReservaParaPenalizarAsync(AppDbContext context, int reservaLabId)
        {
            var reserva = await context.ReservasLabs.Include(r => r.Usuario).FirstOrDefaultAsync(r => r.Id == reservaLabId)
                ?? throw new ResourceNotFoundException($"No se encontró la reserva con el id {reservaLabId}");

            if (reserva.Estado != EstadoReserva.Confirmada.ToString() && reserva.Estado != EstadoReserva.Finalizada.ToString())
                throw new ConflictException(
                    "Solo se puede registrar una penalización sobre reservas Confirmadas o Finalizadas (el usuario debe haber hecho uso del laboratorio).");

            return reserva;
        }

        public static async Task ValidarSinPenalizacionPendienteDuplicadaAsync(
            AppDbContext context, int? prestamoId, int? reservaLabId)
        {
            var yaExiste = await context.Penalizaciones.AnyAsync(p =>
                p.Estado == EstadoPenalizacion.Pendiente.ToString() &&
                ((prestamoId != null && p.PrestamoId == prestamoId) ||
                 (reservaLabId != null && p.ReservaLabId == reservaLabId)));

            if (yaExiste)
                throw new ConflictException("Ya existe una penalización pendiente registrada para este origen.");
        }

        public static void ValidarPuedeResolver(Penalizacion penalizacion)
        {
            if (penalizacion.Estado != EstadoPenalizacion.Pendiente.ToString())
                throw new ConflictException("Solo se pueden marcar como pagadas penalizaciones pendientes.");
        }

        public static void ValidarPuedeAnular(Penalizacion penalizacion)
        {
            if (penalizacion.Estado != EstadoPenalizacion.Pendiente.ToString())
                throw new ConflictException("Solo se pueden anular penalizaciones pendientes.");
        }
    }
}
