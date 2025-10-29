-- ========================================
-- CONFIGURACIÓN ADICIONAL PARA SUPABASE
-- ========================================
-- Ejecuta este script en Supabase SQL Editor DESPUÉS de aplicar las migraciones

-- 1. FUNCIONES Y TRIGGERS PARA COLUMNAS CALCULADAS
-- ========================================

-- 1.1 Función para calcular res_subtotal automáticamente
CREATE OR REPLACE FUNCTION calcular_subtotal_reserva()
RETURNS TRIGGER AS $$
BEGIN
  NEW.res_subtotal := NEW.res_cantidad_asientos::numeric * NEW.res_precio_unitario;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular subtotal al insertar o actualizar
DROP TRIGGER IF EXISTS trg_calcular_subtotal ON reserva;
CREATE TRIGGER trg_calcular_subtotal
BEFORE INSERT OR UPDATE ON reserva
FOR EACH ROW
EXECUTE FUNCTION calcular_subtotal_reserva();

-- Actualizar valores existentes
UPDATE reserva 
SET res_subtotal = res_cantidad_asientos::numeric * res_precio_unitario 
WHERE res_subtotal IS NULL;

-- 1.2 Función para calcular vl_duracion_minutos automáticamente
CREATE OR REPLACE FUNCTION calcular_duracion_vuelo()
RETURNS TRIGGER AS $$
BEGIN
  NEW.vl_duracion_minutos := (
    EXTRACT(epoch FROM 
      ((NEW.vl_fecha_llegada + NEW.vl_hora_llegada) - (NEW.vl_fecha_salida + NEW.vl_hora_salida))
    ) / 60
  )::int;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular duración al insertar o actualizar
DROP TRIGGER IF EXISTS trg_calcular_duracion ON vuelo;
CREATE TRIGGER trg_calcular_duracion
BEFORE INSERT OR UPDATE ON vuelo
FOR EACH ROW
EXECUTE FUNCTION calcular_duracion_vuelo();

-- Actualizar valores existentes
UPDATE vuelo 
SET vl_duracion_minutos = (
  EXTRACT(epoch FROM ((vl_fecha_llegada + vl_hora_llegada) - (vl_fecha_salida + vl_hora_salida))) / 60
)::int
WHERE vl_duracion_minutos IS NULL;

-- 2. FUNCIÓN PARA VALIDAR DISPONIBILIDAD DE ASIENTOS
-- ========================================
CREATE OR REPLACE FUNCTION validar_disponibilidad_asientos()
RETURNS TRIGGER AS $$
DECLARE
  asientos_disponibles INT;
BEGIN
  -- Obtener asientos disponibles
  SELECT vlcat_asientos_disponibles 
  INTO asientos_disponibles
  FROM vuelo_categoria
  WHERE vl_id = NEW.vl_id AND cat_id = NEW.cat_id;

  -- Validar disponibilidad
  IF asientos_disponibles IS NULL THEN
    RAISE EXCEPTION 'Categoría no encontrada para este vuelo';
  END IF;

  IF asientos_disponibles < NEW.res_cantidad_asientos THEN
    RAISE EXCEPTION 'No hay suficientes asientos disponibles. Disponibles: %, Solicitados: %', 
      asientos_disponibles, NEW.res_cantidad_asientos;
  END IF;

  -- Decrementar asientos disponibles
  UPDATE vuelo_categoria
  SET vlcat_asientos_disponibles = vlcat_asientos_disponibles - NEW.res_cantidad_asientos
  WHERE vl_id = NEW.vl_id AND cat_id = NEW.cat_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGER PARA VALIDAR DISPONIBILIDAD AL CREAR RESERVA
-- ========================================
DROP TRIGGER IF EXISTS trg_validar_disponibilidad ON reserva;

CREATE TRIGGER trg_validar_disponibilidad
BEFORE INSERT ON reserva
FOR EACH ROW
EXECUTE FUNCTION validar_disponibilidad_asientos();

-- 4. FUNCIÓN PARA DEVOLVER ASIENTOS AL CANCELAR RESERVA
-- ========================================
CREATE OR REPLACE FUNCTION devolver_asientos()
RETURNS TRIGGER AS $$
BEGIN
  -- Devolver asientos disponibles
  UPDATE vuelo_categoria
  SET vlcat_asientos_disponibles = vlcat_asientos_disponibles + OLD.res_cantidad_asientos
  WHERE vl_id = OLD.vl_id AND cat_id = OLD.cat_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGER PARA DEVOLVER ASIENTOS AL ELIMINAR RESERVA
-- ========================================
DROP TRIGGER IF EXISTS trg_devolver_asientos ON reserva;

CREATE TRIGGER trg_devolver_asientos
BEFORE DELETE ON reserva
FOR EACH ROW
EXECUTE FUNCTION devolver_asientos();

-- 6. VERIFICAR QUE TODO SE CREÓ CORRECTAMENTE
-- ========================================
SELECT 
  'Triggers creados correctamente' as status,
  COUNT(*) as total_triggers
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name IN ('trg_validar_disponibilidad', 'trg_devolver_asientos');

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Configuración de Supabase completada exitosamente';
  RAISE NOTICE '✅ Columna calculada: res_subtotal';
  RAISE NOTICE '✅ Triggers: validación y devolución de asientos';
END $$;

