// Variables globales
let eventosInicializados = false;

// Función para cargar artículos al cambiar el número de orden de compra
function cargarArticulosPorOrdenCompra() {
    const ordenCompra = $('#orden_compra').val().trim();
    
    // Limpiar el selector de materiales
    $('#material_selector').empty().append('<option value="">Seleccione un material</option>');
    $('#material_selector_container').hide();
    
    if (!ordenCompra) {
        return;
    }
    
    // Mostrar indicador de carga
    Swal.fire({
        title: 'Cargando materiales...',
        text: 'Buscando materiales de la orden de compra',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Realizar la solicitud AJAX
    $.ajax({
        url: `/buscar_articulos_por_oc/${ordenCompra}`,
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            Swal.close();
            
            if (response.status === 'success') {
                const articulos = response.articulos;
                
                if (articulos.length === 0) {
                    Swal.fire('Información', 'La orden de compra no tiene artículos asociados', 'info');
                    return;
                }
                
                // Si hay un solo artículo, llenar directamente los campos
                if (articulos.length === 1) {
                    $('#descripcion_material').val(articulos[0].descripcion);
                    $('#cantidad').val(articulos[0].unidades);
                    $('#proveedor').val(articulos[0].proveedor);
                    // Guardar el ID de orden de compra
                    $('#idordencompra').val(response.docto_cm_id);
                    return;
                }
                
                // Si hay más de un artículo, mostrar selector
                $('#material_selector_container').show();
                
                // Llenar el selector de materiales
                articulos.forEach(function(articulo) {
                    $('#material_selector').append(
                        `<option value="${articulo.articulo_id}" 
                         data-descripcion="${articulo.descripcion}"
                         data-unidades="${articulo.unidades}"
                         data-proveedor="${articulo.proveedor}">
                         ${articulo.descripcion} (${articulo.unidades} unidades)
                         </option>`
                    );
                });
                
                // Almacenar el ID de documento para uso posterior
                $('#idordencompra').val(response.docto_cm_id);
                
                // Notificar al usuario
                Swal.fire('Éxito', 'Seleccione un material de la lista', 'success');
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        },
        error: function(xhr, status, error) {
            Swal.close();
            Swal.fire('Error', 'Ocurrió un error al cargar los materiales', 'error');
            console.error(error);
        }
    });
}

// Función para manejar la selección de material
function seleccionarMaterial() {
    const optionSelected = $('#material_selector option:selected');
    
    if (optionSelected.val()) {
        // Llenar campos con datos del material seleccionado
        $('#descripcion_material').val(optionSelected.data('descripcion'));
        $('#cantidad').val(optionSelected.data('unidades'));
        $('#proveedor').val(optionSelected.data('proveedor'));
    } else {
        // Limpiar campos si no hay selección
        $('#descripcion_material').val('');
        $('#cantidad').val('');
    }
}

// Configurar UI para búsqueda de materiales
function configurarInterfazBusquedaMateriales() {
    // Agregar contenedor para selector de materiales si no existe
    if (!$('#material_selector_container').length) {
        const selectorHtml = `
            <div id="material_selector_container" class="row mb-3" style="display: none;">
                <div class="col-md-12">
                    <label for="material_selector" class="form-label">Seleccione Material</label>
                    <select class="form-select" id="material_selector">
                        <option value="">Seleccione un material</option>
                    </select>
                </div>
            </div>
        `;
        
        // Insertar después de la fila que contiene orden_compra
        $(selectorHtml).insertAfter($('#orden_compra').closest('.row'));
    }
    
    // Asegurarse de que exista el campo oculto
    if (!$('#idordencompra').length) {
        $('<input type="hidden" id="idordencompra" name="idordencompra">').appendTo('#formRecibo');
    }
}

// Inicialización una sola vez de eventos
function inicializarEventos() {
    if (eventosInicializados) return;
    
    // Configurar UI
    configurarInterfazBusquedaMateriales();
    
    // Eliminar cualquier evento previo
    $('#orden_compra').off('change');
    $(document).off('change', '#material_selector');
    
    // Agregar nuevos listeners
    $('#orden_compra').on('change', cargarArticulosPorOrdenCompra);
    $(document).on('change', '#material_selector', seleccionarMaterial);
    
    eventosInicializados = true;
}

// Cuando se abre el documento
$(document).ready(function() {
    inicializarEventos();
    
    // Inicializar DataTable
    $('#tablaRecibos').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
        },
        paging: true,
        ordering: true,
        info: true,
        searching: false,
        pageLength: 10
    });
    
    // Manejar el formulario de nuevo/editar recibo
    $('#btnGuardarRecibo').click(function() {
        $('#formRecibo').submit();
    });
    
    // Abrir modal para nuevo recibo
    $('#btnNuevoRecibo').click(function() {
        resetearFormulario();
        $('#modalNuevoRecibo').modal('show');
    });
    
    // Función para resetear formulario
    function resetearFormulario() {
        $('#formRecibo')[0].reset();
        $('#formRecibo input[name="id"]').val('');
        $('#formRecibo input[name="accion"]').val('nuevo');
        $('.modal-title').text('Nuevo Recibo de Material');
        $('#fecha').val($('#fecha').attr('value') || '');
        $('#material_selector_container').hide();
    }
    
    // Abrir modal para editar
    $(document).on('click', '.editar-recibo', function() {
        const id = $(this).data('id');
        
        // Mostrar spinner o mensaje de carga
        Swal.fire({
            title: 'Cargando datos...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Cargar datos del recibo
        $.ajax({
            url: `/obtener_recibo/${id}`,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                Swal.close();
                
                if (data.status === 'success') {
                    const recibo = data.recibo;
                    
                    // Asignar valores a los campos
                    $('#formRecibo input[name="id"]').val(recibo.id);
                    $('#formRecibo input[name="accion"]').val('editar');
                    $('#idcode').val(recibo.idcode);
                    $('#fecha').val(recibo.fecha);
                    $('#orden_compra').val(recibo.orden_compra);
                    $('#proveedor').val(recibo.proveedor);
                    $('#num_remision').val(recibo.num_remision);
                    $('#cantidad').val(recibo.cantidad);
                    $('#tipo').val(recibo.tipo);
                    $('#descripcion_material').val(recibo.descripcion_material);
                    $('#grado_acero').val(recibo.grado_acero);
                    $('#num_placa').val(recibo.num_placa);
                    $('#num_colada').val(recibo.num_colada);
                    $('#num_certificado').val(recibo.num_certificado);
                    $('#ot').val(recibo.ot);
                    $('#cliente').val(recibo.cliente);
                    $('#estatus').val(recibo.estatus);
                    $('#reporte_focc03').val(recibo.reporte_focc03);
                    $('#procedencia').val(recibo.procedencia);
                    $('#idordencompra').val(recibo.idordencompra);
                    
                    // Ocultar el selector de materiales en modo edición
                    $('#material_selector_container').hide();
                    
                    // Cambiar título del modal
                    $('.modal-title').text('Editar Recibo de Material');
                    
                    // Mostrar el modal
                    $('#modalNuevoRecibo').modal('show');
                } else {
                    Swal.fire('Error', 'No se pudo cargar el recibo', 'error');
                }
            },
            error: function() {
                Swal.close();
                Swal.fire('Error', 'Ocurrió un error al cargar el recibo', 'error');
            }
        });
    });
    
 
    
    // Manejo de selección de recibos
    $('#seleccionarTodos').change(function() {
        $('.seleccion-recibo').prop('checked', $(this).prop('checked'));
        actualizarBotonesSeleccion();
    });
    
    $(document).on('change', '.seleccion-recibo', function() {
        actualizarBotonesSeleccion();
    });
    
    function actualizarBotonesSeleccion() {
        const haySeleccionados = $('.seleccion-recibo:checked').length > 0;
        $('#btnExportarSeleccionados').prop('disabled', !haySeleccionados);
        $('#btnImportarSQL').prop('disabled', !haySeleccionados);
        
        // Verificar si hay recibos con el mismo valor en reporte_focc03
        const reportesSeleccionados = new Set();
        $('.seleccion-recibo:checked').each(function() {
            const reporte = $(this).closest('tr').find('td:eq(8)').text().trim();
            if (reporte) reportesSeleccionados.add(reporte);
        });
        
        $('#btnExportarReporte').prop('disabled', reportesSeleccionados.size !== 1);
    }
    
    // Exportar a Excel todos los registros
    $('#btnExportarExcel').click(function() {
        window.location.href = `${window.location.pathname}exportar_excel?todos=1`;
    });
    
    // Exportar a Excel seleccionados
    $('#btnExportarSeleccionados').click(function() {
        const ids = [];
        $('.seleccion-recibo:checked').each(function() {
            ids.push($(this).val());
        });
        
        if (ids.length > 0) {
            window.location.href = `${window.location.pathname}exportar_excel?ids=${ids.join(',')}`;
        }
    });
    
    // Importar a SQL Server
    $('#btnImportarSQL').click(function() {
        const ids = [];
        $('.seleccion-recibo:checked').each(function() {
            ids.push($(this).val());
        });
        
        if (ids.length > 0) {
            Swal.fire({
                title: '¿Confirmar importación?',
                text: 'Se importarán los registros seleccionados a SQL Server',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, importar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: `${window.location.pathname}importar_sqlserver`,
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ ids: ids }),
                        dataType: 'json',
                        success: function(response) {
                            let html = '';
                            if (response.logs && response.logs.length > 0) {
                                html += '<div class="mt-3"><pre class="bg-dark text-white p-3" style="max-height: 300px; overflow-y: auto;">';
                                response.logs.forEach(log => {
                                    html += log + '\n';
                                });
                                html += '</pre></div>';
                            }
                            
                            if (response.status === 'success') {
                                Swal.fire({
                                    title: 'Éxito',
                                    html: response.message + html,
                                    icon: 'success'
                                });
                            } else {
                                Swal.fire({
                                    title: 'Error',
                                    html: response.message + html,
                                    icon: 'error'
                                });
                            }
                        },
                        error: function() {
                            Swal.fire('Error', 'Ocurrió un error durante la importación', 'error');
                        }
                    });
                }
            });
        }
    });
    
    // Generar Reporte FO-CC-03
    $('#btnExportarReporte').click(function() {
        const reporteId = $('.seleccion-recibo:checked').first().closest('tr').find('td:eq(8)').text().trim();
        
        if (reporteId) {
            window.location.href = `${window.location.pathname}exportar_reporte_focc03?reporte=${encodeURIComponent(reporteId)}`;
        }
    });
});