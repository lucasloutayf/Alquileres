import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Términos y Condiciones de Uso
            </h1>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar Gestor de Alquileres ("el Servicio"), usted acepta estar sujeto a estos Términos y Condiciones. 
                Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Descripción del Servicio</h2>
              <p>
                Gestor de Alquileres es una aplicación web diseñada para ayudar a propietarios e inmobiliarias a gestionar 
                sus propiedades de alquiler, incluyendo el seguimiento de inquilinos, pagos, gastos y documentación relacionada.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Registro y Cuenta</h2>
              <p>
                Para utilizar el Servicio, debe crear una cuenta proporcionando información veraz y actualizada. 
                Usted es responsable de mantener la confidencialidad de su cuenta y contraseña, así como de todas 
                las actividades que ocurran bajo su cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Uso Aceptable</h2>
              <p>Usted se compromete a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>No utilizar el Servicio para fines ilegales o no autorizados</li>
                <li>No intentar acceder a cuentas de otros usuarios</li>
                <li>No transmitir virus o código malicioso</li>
                <li>No utilizar el Servicio de manera que pueda dañar o sobrecargar nuestros sistemas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. Propiedad de los Datos</h2>
              <p>
                Los datos que ingrese en el Servicio (información de propiedades, inquilinos, pagos, etc.) 
                son de su propiedad. Nosotros no reclamamos ningún derecho de propiedad sobre sus datos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Limitación de Responsabilidad</h2>
              <p>
                El Servicio se proporciona "tal cual" y "según disponibilidad". No garantizamos que el Servicio 
                será ininterrumpido, seguro o libre de errores. En ningún caso seremos responsables por daños 
                indirectos, incidentales o consecuentes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán 
                en vigor inmediatamente después de su publicación. El uso continuado del Servicio después de 
                cualquier cambio constituye su aceptación de los nuevos términos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Terminación</h2>
              <p>
                Podemos suspender o terminar su acceso al Servicio en cualquier momento, sin previo aviso, 
                por cualquier motivo, incluyendo si consideramos que ha violado estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9. Contacto</h2>
              <p>
                Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos a través 
                del correo electrónico proporcionado en la aplicación.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
