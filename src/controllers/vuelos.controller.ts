import { Request, Response } from "express";
import { prisma } from "../config/db";

/**
 * ==========================================
 *  OBTENER TODOS LOS VUELOS
 * ==========================================
 */
export const obtenerVuelos = async (_req: Request, res: Response) => {
  try {
    const vuelos = await prisma.vuelo.findMany({
      include: {
        aerolinea: true,
        origen: true,
        destino: true,
        categorias: {
          include: { categoria: true },
        },
      },
      orderBy: { vl_fecha_salida: "asc" },
    });

    res.json(vuelos);
  } catch (error) {
    console.error("❌ Error al obtener vuelos:", error);
    res.status(500).json({ message: "Error al obtener vuelos" });
  }
};

/**
 * ==========================================
 *  OBTENER UN VUELO POR ID
 * ==========================================
 */
export const obtenerVueloPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const vuelo = await prisma.vuelo.findUnique({
      where: { vl_id: id },
      include: {
        aerolinea: true,
        origen: true,
        destino: true,
        categorias: {
          include: { categoria: true },
        },
      },
    });

    if (!vuelo)
      return res.status(404).json({ message: "Vuelo no encontrado" });

    res.json(vuelo);
  } catch (error) {
    console.error("❌ Error al obtener vuelo:", error);
    res.status(500).json({ message: "Error al obtener vuelo" });
  }
};

/**
 * ==========================================
 *  BÚSQUEDA AVANZADA DE VUELOS
 *  Filtros: origen, destino, fecha, aerolínea, 
 *           categoría, directo, estado, tarifa_min, tarifa_max
 * ==========================================
 */
export const buscarVuelos = async (req: Request, res: Response) => {
  try {
    const {
      origen,
      destino,
      fecha,
      aerolinea,
      categoria,
      directo,
      estado,
      tarifa_min,
      tarifa_max,
    } = req.query;

    const filtros: any = {};

    // Filtro por origen (ID de ciudad)
    if (origen) filtros.ciu_origen_id = Number(origen);

    // Filtro por destino (ID de ciudad)
    if (destino) filtros.ciu_destino_id = Number(destino);

    // Filtro por fecha exacta
    if (fecha) {
      const fechaStr = fecha as string;
      const [year, month, day] = fechaStr.split("-");
      filtros.vl_fecha_salida = new Date(`${year}-${month}-${day}`);
    }

    // Filtro por aerolínea (ID)
    if (aerolinea) filtros.aero_id = Number(aerolinea);

    // Filtro por tipo de vuelo (directo o no)
    if (directo) filtros.vl_es_directo = directo === "true";

    // Filtro por estado del vuelo
    if (estado) {
      const estadosValidos = ["programado", "en_hora", "retrasado", "cancelado"];
      if (estadosValidos.includes(estado as string)) {
        filtros.vl_estado = estado;
      }
    }

    // Ejecutar búsqueda con filtros básicos
    let vuelos = await prisma.vuelo.findMany({
      where: filtros,
      include: {
        aerolinea: true,
        origen: true,
        destino: true,
        categorias: {
          include: { categoria: true },
        },
      },
      orderBy: { vl_fecha_salida: "asc" },
    });

    // Filtro por categoría (si aplica)
    if (categoria) {
      const catId = Number(categoria);
      vuelos = vuelos.filter((v) =>
        v.categorias.some((vc) => vc.cat_id === catId)
      );
    }

    // Filtro por rango de tarifa
    if (tarifa_min || tarifa_max) {
      vuelos = vuelos.filter((v) => {
        const precios = v.categorias.map((vc) => Number(vc.vlcat_precio_base));
        const minPrecio = Math.min(...precios);
        const maxPrecio = Math.max(...precios);

        const min = tarifa_min ? Number(tarifa_min) : 0;
        const max = tarifa_max ? Number(tarifa_max) : Infinity;

        return minPrecio >= min && maxPrecio <= max;
      });
    }

    if (vuelos.length === 0) {
      return res
        .status(404)
        .json({
          message: "No se encontraron vuelos con los filtros especificados",
        });
    }

    res.json(vuelos);
  } catch (error) {
    console.error("❌ Error al buscar vuelos:", error);
    res.status(500).json({ message: "Error al buscar vuelos" });
  }
};

/**
 * ==========================================
 *  BÚSQUEDA POR HORARIOS
 *  Similar a búsqueda normal pero enfocado en horarios
 * ==========================================
 */
export const buscarPorHorarios = async (req: Request, res: Response) => {
  try {
    const { origen, destino, fecha, hora_salida_min, hora_salida_max } =
      req.query;

    if (!origen || !destino || !fecha) {
      return res.status(400).json({
        message:
          "Se requieren parámetros: origen, destino, fecha (YYYY-MM-DD)",
      });
    }

    const fechaStr = fecha as string;
    const [year, month, day] = fechaStr.split("-");
    
    // Buscar todos los vuelos y filtrar por fecha (ignorando hora)
    const todosVuelos = await prisma.vuelo.findMany({
      where: {
        ciu_origen_id: Number(origen),
        ciu_destino_id: Number(destino),
      },
      include: {
        aerolinea: true,
        origen: true,
        destino: true,
        categorias: {
          include: { categoria: true },
        },
      },
      orderBy: { vl_hora_salida: "asc" },
    });

    // Filtrar por fecha usando string ISO (ignorando zona horaria)
    const vuelos = todosVuelos.filter((vuelo) => {
      const fechaVueloStr = new Date(vuelo.vl_fecha_salida).toISOString().split('T')[0];
      const fechaBuscadaStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      return fechaVueloStr === fechaBuscadaStr;
    });

    if (vuelos.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay vuelos en ese horario y fecha" });
    }

    res.json(vuelos);
  } catch (error) {
    console.error("❌ Error al buscar por horarios:", error);
    res.status(500).json({ message: "Error al buscar por horarios" });
  }
};

/**
 * ==========================================
 *  BÚSQUEDA POR TARIFAS (ordenado)
 * ==========================================
 */
export const buscarPorTarifas = async (req: Request, res: Response) => {
  try {
    const { origen, destino, fecha, orden } = req.query;

    console.log(`📥 Parámetros recibidos: origen=${origen}, destino=${destino}, fecha=${fecha}`);

    if (!origen || !destino || !fecha) {
      return res.status(400).json({
        message:
          "Se requieren parámetros: origen, destino, fecha (YYYY-MM-DD)",
      });
    }

    const fechaStr = fecha as string;
    const [year, month, day] = fechaStr.split("-");
    
    console.log(`🔍 Buscando vuelos para: ${year}-${month}-${day}`);
    
    // Buscar todos los vuelos y filtrar por fecha (ignorando hora)
    const todosVuelos = await prisma.vuelo.findMany({
      where: {
        ciu_origen_id: Number(origen),
        ciu_destino_id: Number(destino),
      },
      include: {
        aerolinea: true,
        origen: true,
        destino: true,
        categorias: {
          include: { categoria: true },
        },
      },
    });

    console.log(`📊 Total vuelos encontrados en BD: ${todosVuelos.length}`);

    // Filtrar por fecha usando string ISO (ignorando zona horaria)
    const vuelos = todosVuelos.filter((vuelo) => {
      // Convertir la fecha de la BD a formato YYYY-MM-DD sin zona horaria
      const fechaVueloStr = new Date(vuelo.vl_fecha_salida).toISOString().split('T')[0];
      const fechaBuscadaStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      console.log(`  Vuelo ${vuelo.vl_numero}: ${fechaVueloStr} vs buscado: ${fechaBuscadaStr}`);
      
      return fechaVueloStr === fechaBuscadaStr;
    });

    console.log(`✅ Vuelos que coinciden con la fecha: ${vuelos.length}`);

    if (vuelos.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay vuelos para esa ruta y fecha" });
    }

    // Ordenar por tarifa más baja en cada vuelo
    const vuelosConPrecioMinimo = vuelos.map((v) => ({
      ...v,
      precio_minimo: Math.min(
        ...v.categorias.map((vc) => Number(vc.vlcat_precio_base))
      ),
      precio_maximo: Math.max(
        ...v.categorias.map((vc) => Number(vc.vlcat_precio_base))
      ),
    }));

    // Ordenar (asc = menor precio primero, desc = mayor precio primero)
    const ordenamiento = orden === "desc" ? -1 : 1;
    vuelosConPrecioMinimo.sort(
      (a, b) => (a.precio_minimo - b.precio_minimo) * ordenamiento
    );

    res.json(vuelosConPrecioMinimo);
  } catch (error) {
    console.error("❌ Error al buscar por tarifas:", error);
    res.status(500).json({ message: "Error al buscar por tarifas" });
  }
};

/**
 * ==========================================
 *  OBTENER VUELOS DISPONIBLES CON ASIENTOS
 * ==========================================
 */
export const vuelosDisponibles = async (req: Request, res: Response) => {
  try {
    const { origen, destino, fecha } = req.query;

    if (!origen || !destino || !fecha) {
      return res.status(400).json({
        message:
          "Se requieren parámetros: origen, destino, fecha (YYYY-MM-DD)",
      });
    }

    const fechaStr = fecha as string;
    const [year, month, day] = fechaStr.split("-");
    
    // Buscar todos los vuelos y filtrar por fecha (ignorando hora)
    const todosVuelos = await prisma.vuelo.findMany({
      where: {
        ciu_origen_id: Number(origen),
        ciu_destino_id: Number(destino),
      },
      include: {
        aerolinea: true,
        origen: true,
        destino: true,
        categorias: {
          include: { categoria: true },
        },
      },
    });

    // Filtrar por fecha usando string ISO (ignorando zona horaria)
    const vuelos = todosVuelos.filter((vuelo) => {
      const fechaVueloStr = new Date(vuelo.vl_fecha_salida).toISOString().split('T')[0];
      const fechaBuscadaStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      return fechaVueloStr === fechaBuscadaStr;
    });

    // Filtrar solo vuelos con asientos disponibles
    const vuelosConAsientos = vuelos.filter((v) =>
      v.categorias.some((vc) => vc.vlcat_asientos_disponibles > 0)
    );

    if (vuelosConAsientos.length === 0) {
      return res.status(404).json({
        message:
          "No hay vuelos disponibles con asientos en esa ruta y fecha",
      });
    }

    res.json(vuelosConAsientos);
  } catch (error) {
    console.error("❌ Error al obtener vuelos disponibles:", error);
    res.status(500).json({ message: "Error al obtener vuelos disponibles" });
  }
};
