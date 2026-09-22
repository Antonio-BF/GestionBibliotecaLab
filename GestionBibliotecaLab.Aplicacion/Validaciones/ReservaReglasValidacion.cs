using GestionBibliotecaLab.Aplicacion.Excepciones;
using GestionBibliotecaLab.Aplicacion.Queries;
using GestionBibliotecaLab.Dominio.Entidades;
using GestionBibliotecaLab.Dominio.Enums;
using GestionBibliotecaLab.Infraestructura.Context;
using Microsoft.EntityFrameworkCore;

namespace GestionBibliotecaLab.Aplicacion.Validaciones
{
    /// <summary>
    /// Reglas de negocio y validaciones del módulo de Reservas de Laboratorio.
    /// </summary>
    internal static class ReservaReglasValidacion
    {
        // Rango horario y granularidad — confirmado por el usuario.
        public static readonly TimeOnly HoraApertura = new(9, 0);
        public static readonly TimeOnly HoraCierre = new(20, 0);
        public const int IntervaloMinutos = 30;
        public static readonly TimeZoneInfo ZonaHorariaLocal = TimeZoneInfo.FindSystemTimeZoneById("America/Lima");

        public static DateTime ObtenerAhoraLocal() =>
            TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ZonaHorariaLocal);

        public static void ValidarHorarioPermitido(TimeOnly horaInicio, TimeOnly horaFin)
        {
            if (horaFin <= horaInicio)
                throw new ValidationException("La hora de fin debe ser posterior a la hora de inicio.");

            if (horaInicio < HoraApertura || horaFin > HoraCierre)
                throw new ValidationException(
                    $"Las reservas solo pueden realizarse entre las {HoraApertura:hh\\:mm} y las {HoraCierre:hh\\:mm}.");

            if (horaInicio.Minute % IntervaloMinutos != 0 || horaFin.Minute % IntervaloMinutos != 0)
                throw new ValidationException(
                    $"Las reservas deben iniciar y finalizar en intervalos de {IntervaloMinutos} minutos (ej. 9:00, 9:30, 10:00...).");
        }

        public static void ValidarFechaNoEnElPasado(DateOnly fecha, TimeOnly horaInicio)
        {
            if (fecha.ToDateTime(horaInicio) <= ObtenerAhoraLocal())
                throw new ValidationException("No se puede reservar en una fecha u hora que ya pasó.");
        }

        public static async Task<Usuario> ObtenerUsuarioExistenteAsync(AppDbContext context, int usuarioId) =>
            await context.Usuarios.FirstOrDefaultAsync(u => u.Id == usuarioId)
                ?? throw new ResourceNotFoundException($"No se encontró el usuario con el id {usuarioId}");

        public static async Task ValidarSinPenalizacionesPendientesAsync(AppDbContext context, int usuarioId)
        {
            if (await EstadosActivosQueries.UsuarioTienePenalizacionesPendientesAsync(context, usuarioId))
                throw new ConflictException("El usuario tiene penalizaciones pendientes y no puede reservar laboratorios.");
        }

        public static async Task ValidarSinReservaActivaAsync(AppDbContext context, int usuarioId)
        {
            if (await EstadosActivosQueries.UsuarioTieneReservasActivasAsync(context, usuarioId))
                throw new ConflictException(
                    "El usuario ya cuenta con una reserva pendiente o confirmada. Debe finalizarla o cancelarla antes de crear una nueva.");
        }

        public static Task<bool> ExisteSolapamientoAsync(
            AppDbContext context, int laboratorioId, DateOnly fecha, TimeOnly horaInicio, TimeOnly horaFin) =>
            context.ReservasLabs.AnyAsync(r =>
                r.LaboratorioId == laboratorioId &&
                r.Fecha == fecha &&
                (r.Estado == EstadoReserva.Pendiente.ToString() || r.Estado == EstadoReserva.Confirmada.ToString()) &&
                r.HoraInicio < horaFin && r.HoraFin > horaInicio);

        public static async Task<bool> VerificarDisponibilidadAsync(
            AppDbContext context, int laboratorioId, DateOnly fecha, TimeOnly horaInicio, TimeOnly horaFin)
        {
            var laboratorio = await context.Laboratorios.AsNoTracking()
                .FirstOrDefaultAsync(l => l.Id == laboratorioId)
                ?? throw new ResourceNotFoundException($"No se encontró el laboratorio con el id {laboratorioId}");

            if (laboratorio.Estado != EstadoLaboratorio.Disponible.ToString())
                return false;

            return !await ExisteSolapamientoAsync(context, laboratorioId, fecha, horaInicio, horaFin);
        }

        public static bool YaFinalizoElHorario(ReservaLab reserva) =>
            reserva.Fecha.ToDateTime(reserva.HoraFin) <= ObtenerAhoraLocal();

        public static void ValidarPuedeConfirmar(ReservaLab reserva)
        {
            if (reserva.Estado != EstadoReserva.Pendiente.ToString())
                throw new ConflictException("Solo se pueden confirmar reservas en estado Pendiente.");

            if (YaFinalizoElHorario(reserva))
                throw new ConflictException("No se puede confirmar: el horario reservado ya finalizó.");
        }

        public static void ValidarPuedeCancelar(ReservaLab reserva, int usuarioIdSolicitante, bool esStaff)
        {
            if (!esStaff && reserva.UsuarioId != usuarioIdSolicitante)
                throw new ForbiddenException("No puedes cancelar una reserva de otro usuario.");

            if (reserva.Estado != EstadoReserva.Pendiente.ToString() && reserva.Estado != EstadoReserva.Confirmada.ToString())
                throw new ConflictException("Solo se pueden cancelar reservas Pendientes o Confirmadas.");
        }
    }
}
