-- =====================================================================
-- Sistema de Gestión de Biblioteca y Reserva de Laboratorios
-- Script de creación de base de datos — SQL Server
-- =====================================================================

CREATE DATABASE SistemaBibliotecaLabDb;
GO

USE SistemaBibliotecaLabDb;
GO

-- =====================================================================
-- 1. Roles
-- =====================================================================
CREATE TABLE dbo.Roles (
    Id          INT IDENTITY(1,1)   NOT NULL,
    Nombre      NVARCHAR(50)        NOT NULL,
    Descripcion NVARCHAR(200)       NULL,
    CONSTRAINT PK_Roles PRIMARY KEY CLUSTERED (Id)
);
GO

CREATE UNIQUE INDEX UQ_Roles_Nombre ON dbo.Roles(Nombre);
GO

-- =====================================================================
-- 2. Usuarios
-- =====================================================================
CREATE TABLE dbo.Usuarios (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    Nombres             NVARCHAR(100)       NOT NULL,
    Apellidos           NVARCHAR(100)       NOT NULL,
    Email               NVARCHAR(150)       NOT NULL,
    PasswordHash        NVARCHAR(MAX)       NOT NULL,
    RolId               INT                 NOT NULL,
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_Usuarios_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2           NULL,
    IsDeleted           BIT                 NOT NULL CONSTRAINT DF_Usuarios_IsDeleted DEFAULT 0,
    CONSTRAINT PK_Usuarios PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Usuarios_Roles_RolId FOREIGN KEY (RolId) REFERENCES dbo.Roles(Id)
);
GO

-- Único solo entre usuarios activos.
CREATE UNIQUE INDEX UQ_Usuarios_Email_Activos ON dbo.Usuarios(Email) WHERE IsDeleted = 0;
GO

CREATE INDEX IX_Usuarios_RolId ON dbo.Usuarios(RolId);
GO

-- =====================================================================
-- 3. Libros
-- =====================================================================
CREATE TABLE dbo.Libros (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    Titulo              NVARCHAR(250)       NOT NULL,
    Autor               NVARCHAR(150)       NOT NULL,
    ISBN                NVARCHAR(20)        NOT NULL,
    CantidadTotal       INT                 NOT NULL,
    CantidadDisponible  INT                 NOT NULL,
    Estado              NVARCHAR(20)        NOT NULL CONSTRAINT DF_Libros_Estado DEFAULT 'Activo',
    RowVersion          ROWVERSION          NOT NULL,
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_Libros_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2           NULL,
    IsDeleted           BIT                 NOT NULL CONSTRAINT DF_Libros_IsDeleted DEFAULT 0,
    CONSTRAINT PK_Libros PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT CK_Libros_Estado CHECK (Estado IN ('Activo', 'Descontinuado')),
    CONSTRAINT CK_Libros_CantidadDisponible CHECK (CantidadDisponible >= 0 AND CantidadDisponible <= CantidadTotal)
);
GO

CREATE UNIQUE INDEX UQ_Libros_ISBN_Activos
    ON dbo.Libros(ISBN)
    WHERE IsDeleted = 0;
GO

CREATE INDEX IX_Libros_Titulo ON dbo.Libros(Titulo);
CREATE INDEX IX_Libros_Autor ON dbo.Libros(Autor);
GO

-- =====================================================================
-- 4. Prestamos
-- =====================================================================
CREATE TABLE dbo.Prestamos (
    Id                          INT IDENTITY(1,1)   NOT NULL,
    UsuarioId                   INT                 NOT NULL,
    LibroId                     INT                 NOT NULL,
    FechaPrestamo               DATETIME2           NOT NULL CONSTRAINT DF_Prestamos_FechaPrestamo DEFAULT SYSUTCDATETIME(),
    FechaDevolucionEsperada     DATETIME2           NOT NULL,
    FechaDevolucionReal         DATETIME2           NULL,
    Estado                      NVARCHAR(20)        NOT NULL CONSTRAINT DF_Prestamos_Estado DEFAULT 'Prestado',
    FechaCreacion               DATETIME2           NOT NULL CONSTRAINT DF_Prestamos_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion          DATETIME2           NULL,
    IsDeleted                   BIT                 NOT NULL CONSTRAINT DF_Prestamos_IsDeleted DEFAULT 0,
    CONSTRAINT PK_Prestamos PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Prestamos_Usuarios_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
    CONSTRAINT FK_Prestamos_Libros_LibroId FOREIGN KEY (LibroId) REFERENCES dbo.Libros(Id),
    CONSTRAINT CK_Prestamos_Estado CHECK (Estado IN ('Prestado', 'Devuelto', 'EnMora')),
    CONSTRAINT CK_Prestamos_Fechas CHECK (FechaDevolucionEsperada > FechaPrestamo)
);
GO

CREATE INDEX IX_Prestamos_UsuarioId_Estado ON dbo.Prestamos(UsuarioId, Estado);
CREATE INDEX IX_Prestamos_LibroId ON dbo.Prestamos(LibroId);

CREATE INDEX IX_Prestamos_FechaDevolucionEsperada_Activos
    ON dbo.Prestamos(FechaDevolucionEsperada)
    WHERE Estado = 'Prestado';
GO

-- =====================================================================
-- 5. Laboratorios
-- =====================================================================
CREATE TABLE dbo.Laboratorios (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    Nombre              NVARCHAR(100)       NOT NULL,
    Capacidad           INT                 NOT NULL,
    Equipamiento        NVARCHAR(500)       NULL,
    Ubicacion           NVARCHAR(150)       NOT NULL,
    Estado              NVARCHAR(20)        NOT NULL CONSTRAINT DF_Laboratorios_Estado DEFAULT 'Disponible',
    RowVersion          ROWVERSION          NOT NULL,
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_Laboratorios_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2           NULL,
    IsDeleted           BIT                 NOT NULL CONSTRAINT DF_Laboratorios_IsDeleted DEFAULT 0,
    CONSTRAINT PK_Laboratorios PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT CK_Laboratorios_Estado CHECK (Estado IN ('Disponible','Mantenimiento','Inactivo')),
    CONSTRAINT CK_Laboratorios_Capacidad CHECK (Capacidad > 0)
);
GO

-- =====================================================================
-- 6. ReservasLab
-- =====================================================================
CREATE TABLE dbo.ReservasLab (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    UsuarioId           INT                 NOT NULL,
    LaboratorioId       INT                 NOT NULL,
    Fecha               DATE                NOT NULL,
    HoraInicio          TIME(0)             NOT NULL,
    HoraFin             TIME(0)             NOT NULL,
    Estado              NVARCHAR(20)        NOT NULL CONSTRAINT DF_ReservasLab_Estado DEFAULT 'Pendiente',
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_ReservasLab_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2           NULL,
    IsDeleted           BIT                 NOT NULL CONSTRAINT DF_ReservasLab_IsDeleted DEFAULT 0,
    CONSTRAINT PK_ReservasLab PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_ReservasLab_Usuarios_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
    CONSTRAINT FK_ReservasLab_Laboratorios_LaboratorioId FOREIGN KEY (LaboratorioId) REFERENCES dbo.Laboratorios(Id),
    CONSTRAINT CK_ReservasLab_Estado CHECK (Estado IN ('Pendiente','Confirmada','Cancelada','Finalizada')),
    CONSTRAINT CK_ReservasLab_Horario CHECK (HoraFin > HoraInicio)
);
GO

-- Salvaguarda contra reservas con el mismo bloque horario exacto.
CREATE UNIQUE INDEX UQ_ReservasLab_Horario_Activas
    ON dbo.ReservasLab(LaboratorioId,Fecha,HoraInicio,HoraFin)
    WHERE IsDeleted = 0;
GO

CREATE INDEX IX_ReservasLab_LaboratorioId_Fecha ON dbo.ReservasLab(LaboratorioId, Fecha);
CREATE INDEX IX_ReservasLab_UsuarioId ON dbo.ReservasLab(UsuarioId);
GO

-- =====================================================================
-- 7. Penalizaciones
-- =====================================================================
CREATE TABLE dbo.Penalizaciones (
    Id                  INT IDENTITY(1,1)   NOT NULL,
    UsuarioId           INT                 NOT NULL,
    PrestamoId          INT                 NULL,
    ReservaLabId        INT                 NULL,
    Tipo                NVARCHAR(30)        NOT NULL,
    Motivo              NVARCHAR(300)       NOT NULL,
    Monto               DECIMAL(10,2)       NULL,
    FechaGeneracion     DATETIME2           NOT NULL CONSTRAINT DF_Penalizaciones_FechaGeneracion DEFAULT SYSUTCDATETIME(),
    FechaResolucion     DATETIME2           NULL,
    Estado              NVARCHAR(20)        NOT NULL CONSTRAINT DF_Penalizaciones_Estado DEFAULT 'Pendiente',
    FechaCreacion       DATETIME2           NOT NULL CONSTRAINT DF_Penalizaciones_FechaCreacion DEFAULT SYSUTCDATETIME(),
    FechaActualizacion  DATETIME2           NULL,
    IsDeleted           BIT                 NOT NULL CONSTRAINT DF_Penalizaciones_IsDeleted DEFAULT 0,
    CONSTRAINT PK_Penalizaciones PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Penalizaciones_Usuarios_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id),
    CONSTRAINT FK_Penalizaciones_Prestamos_PrestamoId FOREIGN KEY (PrestamoId) REFERENCES dbo.Prestamos(Id),
    CONSTRAINT FK_Penalizaciones_ReservasLab_ReservaLabId FOREIGN KEY (ReservaLabId) REFERENCES dbo.ReservasLab(Id),
    CONSTRAINT CK_Penalizaciones_Tipo CHECK (Tipo IN ('DevolucionTardia', 'DanioEquipo', 'Otro')),
    CONSTRAINT CK_Penalizaciones_Estado CHECK (Estado IN ('Pendiente', 'Pagada', 'Anulada')),
    CONSTRAINT CK_Penalizaciones_Origen CHECK (
        (PrestamoId IS NOT NULL AND ReservaLabId IS NULL) 
        OR (PrestamoId IS NULL AND ReservaLabId IS NOT NULL)
    )
);
GO

CREATE INDEX IX_Penalizaciones_UsuarioId_Estado ON dbo.Penalizaciones(UsuarioId, Estado);
GO

-- =====================================================================
-- 8. RefreshTokens
-- =====================================================================
CREATE TABLE dbo.RefreshTokens (
    Id                      INT IDENTITY(1,1)   NOT NULL,
    UsuarioId               INT                 NOT NULL,
    Token                   NVARCHAR(200)       NOT NULL,
    FechaExpiracion         DATETIME2           NOT NULL,
    Revocado                BIT                 NOT NULL CONSTRAINT DF_RefreshTokens_Revocado DEFAULT 0,
    FechaRevocacion         DATETIME2           NULL,
    ReemplazadoPorToken     NVARCHAR(200)       NULL,
    FechaCreacion           DATETIME2           NOT NULL CONSTRAINT DF_RefreshTokens_FechaCreacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_RefreshTokens PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_RefreshTokens_Usuarios_UsuarioId FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_RefreshTokens_Token UNIQUE (Token)
);
GO

CREATE INDEX IX_RefreshTokens_UsuarioId ON dbo.RefreshTokens(UsuarioId);

CREATE INDEX IX_RefreshTokens_FechaExpiracion ON dbo.RefreshTokens(FechaExpiracion);
GO

-- =====================================================================
-- 9. Seed data: Roles
-- =====================================================================
SET IDENTITY_INSERT dbo.Roles ON;

INSERT INTO dbo.Roles (Id, Nombre, Descripcion) VALUES
    (1, 'Administrador', 'Gestiona inventario, laboratorios, usuarios y aprobaciones.'),
    (2, 'Estudiante', 'Solicita libros, reserva laboratorios y consulta su historial.'),
    (3, 'Docente', 'Solicita libros, reserva laboratorios y consulta su historial.');

SET IDENTITY_INSERT dbo.Roles OFF;
GO

-- =====================================================================
-- 10. Procedimientos almacenados
-- =====================================================================

-- =====================================================================
-- 10.1 Verificación rápida de disponibilidad
-- =====================================================================
CREATE OR ALTER PROCEDURE dbo.sp_VerificarDisponibilidadLaboratorio
    @LaboratorioId INT,
    @Fecha DATE,
    @HoraInicio TIME(0),
    @HoraFin TIME(0)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        CASE 
            WHEN EXISTS (
                SELECT 1
                FROM dbo.ReservasLab r
                WHERE r.LaboratorioId = @LaboratorioId
                  AND r.Fecha = @Fecha
                  AND r.IsDeleted = 0
                  AND r.Estado IN ('Pendiente', 'Confirmada')
                  AND r.HoraInicio < @HoraFin
                  AND r.HoraFin > @HoraInicio
            ) 
            THEN CAST(0 AS BIT)
            ELSE CAST(1 AS BIT)
        END AS Disponible;
END
GO

-- =====================================================================
-- 10.2 Generación batch de moras por préstamos vencidos
-- =====================================================================
CREATE OR ALTER PROCEDURE dbo.sp_GenerarMorasPorPrestamosVencidos
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    CREATE TABLE #PrestamosVencidos (
        PrestamoId INT,
        UsuarioId INT
    );

    BEGIN TRANSACTION;

    UPDATE p
    SET Estado = 'EnMora',
        FechaActualizacion = SYSUTCDATETIME()
    OUTPUT 
        inserted.Id, 
        inserted.UsuarioId 
        INTO #PrestamosVencidos(PrestamoId, UsuarioId)
    FROM dbo.Prestamos p
    WHERE p.Estado = 'Prestado'
      AND p.FechaDevolucionEsperada < SYSUTCDATETIME()
      AND p.IsDeleted = 0;

    INSERT INTO dbo.Penalizaciones (
        UsuarioId, 
        PrestamoId, 
        Tipo, 
        Motivo, 
        Estado, 
        FechaGeneracion
    )
    SELECT 
        pv.UsuarioId, 
        pv.PrestamoId, 
        'DevolucionTardia',
        'Generada automáticamente por vencimiento de préstamo.',
        'Pendiente',
        SYSUTCDATETIME()
    FROM #PrestamosVencidos pv
    WHERE NOT EXISTS (
        SELECT 1 
        FROM dbo.Penalizaciones pen
        WHERE pen.PrestamoId = pv.PrestamoId 
          AND pen.Estado = 'Pendiente'
    );

    COMMIT TRANSACTION;

    DROP TABLE #PrestamosVencidos;
END
GO

-- =====================================================================
-- 10.3 Historial consolidado de un usuario
-- =====================================================================
CREATE OR ALTER PROCEDURE dbo.sp_HistorialUsuario
    @UsuarioId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.Id, 
        'Prestamo' AS Tipo, 
        l.Titulo AS Detalle, 
        p.FechaPrestamo AS Fecha, 
        p.Estado
    FROM dbo.Prestamos p
    JOIN dbo.Libros l 
        ON l.Id = p.LibroId
    WHERE p.UsuarioId = @UsuarioId 
      AND p.IsDeleted = 0

    UNION ALL

    SELECT 
        r.Id, 
        'ReservaLab' AS Tipo, 
        lab.Nombre AS Detalle,
        CAST(r.Fecha AS DATETIME2) AS Fecha, 
        r.Estado
    FROM dbo.ReservasLab r
    JOIN dbo.Laboratorios lab 
        ON lab.Id = r.LaboratorioId
    WHERE r.UsuarioId = @UsuarioId 
      AND r.IsDeleted = 0

    ORDER BY Fecha DESC;
END
GO

-- =====================================================================
-- 10.4 Limpieza de RefreshTokens expirados
-- =====================================================================
CREATE OR ALTER PROCEDURE dbo.sp_LimpiarRefreshTokensExpirados
    @DiasRetencion INT = 30
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.RefreshTokens
    WHERE FechaExpiracion < DATEADD(
        DAY, 
        -@DiasRetencion, 
        SYSUTCDATETIME()
    );
END
GO