import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Política de Privacidad
            </h1>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Información que Recopilamos</h2>
              <p>Recopilamos los siguientes tipos de información:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Información de cuenta:</strong> Email, nombre (opcional) al registrarse</li>
                <li><strong>Datos de uso:</strong> Información sobre cómo utiliza el Servicio</li>
                <li><strong>Datos de propiedades e inquilinos:</strong> Información que usted ingresa voluntariamente</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Uso de la Información</h2>
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Proporcionar y mantener el Servicio</li>
                <li>Notificarle sobre cambios en el Servicio</li>
                <li>Proporcionar soporte al cliente</li>
                <li>Detectar y prevenir problemas técnicos</li>
                <li>Mejorar la experiencia del usuario</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Almacenamiento y Seguridad</h2>
              <p>
                Sus datos se almacenan de forma segura en Firebase (Google Cloud Platform), cumpliendo con 
                los estándares de seguridad de la industria. Utilizamos cifrado en tránsito (HTTPS) y 
                en reposo para proteger su información.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Compartir Información</h2>
              <p>
                <strong>No vendemos, alquilamos ni compartimos</strong> su información personal con terceros, 
                excepto en los siguientes casos:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Con su consentimiento explícito</li>
                <li>Para cumplir con obligaciones legales</li>
                <li>Para proteger nuestros derechos legales</li>
                <li>Con proveedores de servicios que nos ayudan a operar (Firebase/Google)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. Cookies y Tecnologías Similares</h2>
              <p>
                Utilizamos cookies esenciales para el funcionamiento del Servicio (autenticación, preferencias).
                También podemos utilizar herramientas de análisis (como Google Analytics) para entender 
                cómo se utiliza el Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Sus Derechos</h2>
              <p>Usted tiene derecho a:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Acceder a sus datos personales</li>
                <li>Rectificar datos incorrectos</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Exportar sus datos en un formato legible</li>
                <li>Retirar su consentimiento en cualquier momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. Retención de Datos</h2>
              <p>
                Conservamos sus datos mientras mantenga una cuenta activa. Puede solicitar la eliminación 
                de sus datos en cualquier momento contactándonos. Los datos eliminados pueden permanecer 
                en copias de seguridad por un período limitado.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Menores de Edad</h2>
              <p>
                El Servicio no está dirigido a menores de 18 años. No recopilamos conscientemente 
                información de menores de edad.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9. Cambios en esta Política</h2>
              <p>
                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre 
                cambios significativos publicando la nueva política en esta página y actualizando 
                la fecha de "última actualización".
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">10. Contacto</h2>
              <p>
                Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, 
                puede contactarnos a través del correo electrónico proporcionado en la aplicación.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
