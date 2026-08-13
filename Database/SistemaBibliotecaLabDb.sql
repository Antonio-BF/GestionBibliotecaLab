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

-- =====================================================================
-- 11. Seed data: Usuarios
-- =====================================================================

INSERT INTO dbo.Usuarios ( Nombres, Apellidos, Email, PasswordHash, RolId ) VALUES 
( 'Administrador', 'Sistema', 'admin@bibliotecalab.com', '$2a$11$s1hs6IMqg9CfpjBdP70FS.L1VsqqIPh2zZ.sYbE1SR7pCKxu06z5W', 1 ), -- Password: Admin123!
( 'Juan', 'Perez', 'juan.perez@bibliotecalab.com', '$2a$11$OmYmIGGK3M5.v8OuVKooF.ialAEwCN.41NJZOji6qvxcCaYi1T4ai', 2 ),  -- Password: Estudiante123!
( 'Maria', 'Gomez', 'maria.gomez@bibliotecalab.com', '$2a$11$GGVB4SqUtoIkRTqeKVX2Wu42lYDK/EsFw11/9nbNxViaqBgsyd2Ka', 3 );  -- Password: Docente123!
GO

-- =====================================================================
-- 12. Seed data: Libros
-- =====================================================================

INSERT INTO dbo.Libros (Titulo, Autor, ISBN, CantidadTotal, CantidadDisponible, Estado) VALUES
( 'Clean Code', 'Robert C. Martin', '9780132350884', 5, 4, 'Activo' ),
( 'The Pragmatic Programmer', 'David Thomas y Andrew Hunt', '9780135957059', 3, 2, 'Activo' ),
( 'Design Patterns', 'Erich Gamma, Richard Helm, Ralph Johnson y John Vlissides', '9780201633610', 4, 4, 'Activo' ),
( 'Introduction to Algorithms', 'Thomas H. Cormen', '9780262046305', 2, 1, 'Activo' ),
( 'Database System Concepts', 'Abraham Silberschatz', '9780078022159', 6, 6, 'Activo' ),
( 'Artificial Intelligence: A Modern Approach', 'Stuart Russell y Peter Norvig', '9780134610993', 2, 1, 'Activo' ),
( 'Computer Networks', 'Andrew S. Tanenbaum', '9780132126953', 3, 3, 'Activo' ),
( 'Refactoring', 'Martin Fowler', '9780134757599', 5, 5, 'Activo' ),
( 'Legacy Programming Guide', 'Editorial Técnica', '9789999999991', 2, 2, 'Descontinuado' );
GO


-- =====================================================================
-- 13. Seed data: Laboratorios
-- =====================================================================

INSERT INTO dbo.Laboratorios (Nombre, Capacidad, Equipamiento, Ubicacion, Estado) VALUES
( 'Laboratorio de Computación 1', 30, '30 PCs Intel Core i5, proyector, pizarra digital, acceso a Internet', 'Pabellón A - Primer Piso', 'Disponible' ),
( 'Laboratorio de Computación 2', 25, '25 PCs Intel Core i7, proyector, pizarra digital, acceso a Internet', 'Pabellón A - Segundo Piso', 'Disponible' ),
( 'Laboratorio de Redes', 20, '20 PCs, routers Cisco, switches administrables, racks de comunicaciones', 'Pabellón B - Primer Piso', 'Disponible' ),
( 'Laboratorio de Inteligencia Artificial', 20, '20 PCs con GPU, servidores de entrenamiento, proyector', 'Pabellón B - Segundo Piso', 'Disponible' ),
( 'Laboratorio de Electrónica', 15, 'Osciloscopios, fuentes de poder, multímetros, generadores de señales', 'Pabellón C - Primer Piso', 'Mantenimiento' );
GO


-- =====================================================================
-- 14. Seed data: Prestamos
-- =====================================================================

INSERT INTO dbo.Prestamos (UsuarioId, LibroId, FechaPrestamo, FechaDevolucionEsperada, FechaDevolucionReal, Estado) VALUES
( 2, 1, '2026-08-10 09:00:00', '2026-08-20 23:59:59', NULL, 'Prestado' ), -- Juan Pérez - préstamo activo
( 3, 2, '2026-08-11 10:30:00', '2026-08-18 23:59:59', NULL, 'Prestado' ), -- María Gómez - préstamo activo
( 2, 3, '2026-07-20 11:00:00', '2026-08-03 23:59:59', '2026-07-30 15:30:00', 'Devuelto' ), -- Juan Pérez - préstamo devuelto
( 3, 4, '2026-07-25 09:30:00', '2026-08-05 23:59:59', NULL, 'EnMora' ), -- María Gómez - préstamo vencido
( 2, 5, '2026-07-10 14:00:00', '2026-07-24 23:59:59', '2026-07-22 16:00:00', 'Devuelto' ), -- Juan Pérez - préstamo devuelto
( 3, 6, '2026-08-12 08:30:00', '2026-08-25 23:59:59', NULL, 'Prestado' ), -- María Gómez - préstamo activo
( 1, 7, '2026-06-15 10:00:00', '2026-06-29 23:59:59', '2026-06-25 12:00:00', 'Devuelto' ), -- Administrador - préstamo devuelto
( 2, 8, '2026-07-01 09:00:00', '2026-07-15 23:59:59', '2026-07-12 17:00:00', 'Devuelto' ); -- Juan Pérez - préstamo devuelto
GO

-- =====================================================================
-- 15. Seed data: ReservasLab
-- =====================================================================

INSERT INTO dbo.ReservasLab (UsuarioId,LaboratorioId,Fecha,HoraInicio,HoraFin,Estado)
VALUES
(2,1,'2026-08-14','09:00','11:00','Confirmada'), -- Juan Pérez
(3,2,'2026-08-14','14:00','16:00','Pendiente'), -- María Gómez
(2,3,'2026-08-15','10:00','12:00','Confirmada'), -- Juan Pérez
(3,1,'2026-08-14','11:00','13:00','Pendiente'), -- María Gómez
(2,4,'2026-08-10','09:00','11:00','Finalizada'), -- Juan Pérez - reserva ya realizada
(3,3,'2026-08-08','15:00','17:00','Cancelada'), -- María Gómez - reserva cancelada
(1,1,'2026-08-17','08:00','09:30','Confirmada'), -- Administrador
(2,2,'2026-08-18','16:00','18:00','Pendiente'); -- Juan Pérez
GO


-- =====================================================================
-- 16. Seed data: Penalizaciones
-- =====================================================================

INSERT INTO dbo.Penalizaciones (UsuarioId,PrestamoId, ReservaLabId,Tipo,Motivo,Monto,FechaGeneracion,FechaResolucion,Estado)
VALUES
(3,4,NULL, 'DevolucionTardia','Devolución tardía del libro "Introduction to Algorithms".',15.00,'2026-08-06 08:00:00',NULL,'Pendiente'), -- Penalización por devolución tardía
(2,NULL,5,'DanioEquipo','Daño reportado en un equipo utilizado durante la reserva del laboratorio.',75.00,'2026-08-11 10:00:00',NULL,'Pendiente'), -- Penalización por daño de equipo asociado a una reserva
(2,3,NULL,'DevolucionTardia','Devolución tardía registrada en un préstamo anterior.',10.00,'2026-07-31 09:00:00','2026-08-02 14:30:00','Pagada'), -- Penalización ya pagada
(3,NULL,6,'Otro','Incidencia registrada durante una reserva posteriormente anulada.',20.00,'2026-08-09 09:00:00','2026-08-10 11:00:00','Anulada'); -- Penalización anulada
GO