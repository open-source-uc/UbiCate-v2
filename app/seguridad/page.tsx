"use client";

import Link from "next/link";

import { useState } from "react";

export default function Page() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <main spellCheck="false" className="w-full pb-7">
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="w-full text-center px-4 max-w-5xl mx-auto mt-84">
          <Link
            href="/"
            className="inline-block mb-6 text-white-ubi hover:text-primary transition-colors duration-200 underline"
          >
            ← Volver a inicio
          </Link>

          <h1 className="text-xl font-bold mb-8 text-white-ubi">
            En caso de emergencia en el campus, comuníquese al siguiente número:
          </h1>
          <div className="bg-secondary rounded-lg p-8 mb-6 text-center">
            <a
              href="tel:+56 9 5504 5000"
              className="text-5xl font-bold text-primary transition-colors duration-200 block underline"
            >
              +56 9 5504 5000
            </a>
          </div>
          <div className="bg-primary rounded-lg p-8 border-2 text-white w-full text-left border-secondary">
            <h3 className="mt-0">
              <strong>En caso de emergencia comunícate a este número:</strong>
            </h3>
            <ul className="list-disc list-inside mt-4">
              <li>Teléfonos Fijos UC: Anexo 5000</li>
              <li>
                Celulares:{" "}
                <Link className="text-yellow-300 underline font-bold" href="tel:+56955045000">
                  +56 955045000
                </Link>
              </li>
            </ul>
            <p className="mt-4">Espera la llegada del personal calificado y sigue sus instrucciones.</p>
            <p className="mt-4">
              <strong>
                En caso de vivir una situación que atenta contra la seguridad de una persona en un campus o sus
                inmediaciones:
              </strong>
            </p>
            <p className="mt-2">
              Debes comunicarte al{" "}
              <Link className="text-yellow-300 underline font-bold" href="tel:+56955045000">
                +56 955045000
              </Link>{" "}
              si eres víctima o testigo de:
            </p>
            <ul className="list-disc list-inside mt-4">
              <li>Hurto</li>
              <li>Robo al interior del campus</li>
              <li>Delito en las inmediaciones del campus</li>
              <li>Delito de connotación sexual</li>
              <li>Riñas al interior del campus</li>
              <li>Manifestaciones al exterior del campus</li>
              <li>Emergencia exterior que cause cierre del campus</li>
            </ul>
            <p className="mt-4">
              Si quieres conocer en específico todos los procedimientos de seguridad puedes revisar el{" "}
              <Link
                href="https://uccl0.sharepoint.com/sites/uc365_Gestion_de_documentos-Emergencias/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2Fuc365%5FGestion%5Fde%5Fdocumentos%2DEmergencias%2FShared%20Documents%2FManuales%20y%20procedimientos%2FInstructivo%20de%20seguridad%20para%20la%20comunidad%20UC%2Epdf&parent=%2Fsites%2Fuc365%5FGestion%5Fde%5Fdocumentos%2DEmergencias%2FShared%20Documents%2FManuales%20y%20procedimientos&p=true&ga=1"
                className="text-yellow-300 underline font-bold"
              >
                Instructivo de seguridad para la Comunidad UC.
              </Link>
            </p>
          </div>

          {/* Nuevas secciones */}
          <div className="mt-12 w-full text-left">
            <h3 className=" text-xl font-bold text-white-ubi mb-8 text-center">
              Lo que debo saber en caso de emergencias de salud:
            </h3>

            {/* Sección Estudiante */}
            <div className="bg-primary rounded-lg border-2 border-secondary text-white w-full mb-6">
              <button
                onClick={() => toggleSection("estudiante")}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-opacity-80 transition-colors"
              >
                <h3 className="text-xl font-bold">Soy Estudiante</h3>
                <span className="text-2xl">{expandedSection === "estudiante" ? "−" : "+"}</span>
              </button>
              {expandedSection === "estudiante" && (
                <div className="px-6 pb-6 border-t border-secondary">
                  <h4 className="font-bold mb-4 mt-4">
                    ¿Qué debo hacer si tengo una emergencia de salud en mi campus?
                  </h4>
                  <p>
                    Si tienes una emergencia dentro del campus, es decir, un accidente o situación que ponga en riesgo
                    tu vida, <strong>debes:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>Llamar:</strong>
                      <ul className="list-disc list-inside ml-6 space-y-2 mt-2">
                        <li>
                          desde teléfonos fijos en la UC al <strong>anexo 5000</strong>
                        </li>
                        <li>
                          desde celulares al{" "}
                          <Link className="text-yellow-300 underline font-bold" href="tel:+56955045000">
                            +56 9 5504 5000
                          </Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Quedarte donde estás</strong> y esperar que el personal de salud y/o el encargado de
                      vigilancia lleguen al lugar. <strong>Sigue sus indicaciones.</strong>
                    </li>
                    <li>
                      <strong>
                        Casa Central, Campus San Joaquín, Campus Oriente y Lo Contador cuentan con un equipo de salud
                        para atención de emergencias,
                      </strong>{" "}
                      el cual acudirá al lugar del incidente. La enfermera o Tens te entregará la atención que necesites
                      y decidirá si es necesario trasladarte a un servicio de urgencia. Dependiendo de la gravedad se
                      llamará a un vehículo de aplicación o al sistema de ambulancia en convenio con la UC o SAMU. Esto
                      no tendrá costo para ti.
                    </li>
                    <li>
                      <strong>Campus Villarrica</strong> cuenta con un protocolo de atención a emergencias.
                    </li>
                  </ul>

                  <h4 className="font-bold mb-4 mt-6">
                    Si es necesario que me trasladen a un Servicio de Urgencia, ¿cuáles son mis opciones?
                  </h4>
                  <p className="mb-4">
                    En caso de ser una emergencia médica, debes decir a qué lugar quieres que te trasladen:
                  </p>

                  <div className="mb-1 bg-primary bg-opacity-20 p-4 rounded">
                    <h5 className="font-bold mb-2">1. Servicio de Urgencia del Hospital Clínico UC CHRISTUS</h5>
                    <p className="mb-2">
                      En caso de accidente puedes pedir que te lleven al Hospital Clínico UC Christus. Los alumnos UC
                      tienen beneficios económicos en ese lugar,{" "}
                      <strong>
                        siempre que sea un accidente producto de la actividad académica, y cuentes con una &quot;carta
                        de resguardo&quot; emitida por el equipo de emergencias del campus o por Salud y Bienestar
                        Estudiantil.
                      </strong>{" "}
                      La universidad:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>
                        Cubre el <strong>100% de la consulta médica</strong> de urgencia
                      </li>
                      <li>
                        <strong>NO cubre</strong> insumos de farmacia o enfermería,{" "}
                        <strong>exámenes ni procedimientos</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-1 bg-primary bg-opacity-20 p-4 rounded">
                    <h5 className="font-bold mb-2">2. Servicio de Urgencia de Hospital Público</h5>
                    <p>
                      En caso de accidente en el campus o en trayecto hacia o desde este, podrás elegir ser trasladado a
                      un Hospital Público. En este caso, los gastos médicos son cubiertos en su totalidad por el Seguro
                      Escolar Estatal. Para ello, debes solicitar la <i>declaración individual de accidente escolar</i>{" "}
                      a la enfermera del campus (si fuiste atendido por este equipo) o a Salud y Bienestar Estudiantil.
                    </p>
                  </div>

                  <div className="mb-1 bg-primary bg-opacity-20 p-4 rounded">
                    <h5 className="font-bold mb-2">
                      3. Hospital o clínica según el sistema previsional o seguro individual que tengas contratado
                    </h5>
                    <p>
                      Podrás elegir ser trasladado a un servicio de urgencia con el que tengas convenio. En este caso,
                      los gastos médicos corren por tu cuenta. La Universidad no financiará los gastos incurridos o los
                      copagos comprometidos.
                    </p>
                  </div>

                  <h4 className="font-bold mb-4 mt-6">¿Cuál es el horario de las enfermeras de los campus?</h4>
                  <ul className="list-disc list-inside space-y-2 mb-6">
                    <li>
                      <strong>Campus Casa Central:</strong> 08:00 a 17:00 horas de lunes a jueves y de 08:00 a 16:00
                      horas los viernes
                    </li>
                    <li>
                      <strong>Campus San Joaquín:</strong> 08:00 a 21:20 horas de lunes a viernes, y de 08:00 a 13:00
                      horas los sábados
                    </li>
                    <li>
                      <strong>Campus Oriente:</strong> 08:00 a 17:00 horas de lunes a jueves y de 08:00 a 16:00 horas
                      los viernes
                    </li>
                    <li>
                      <strong>Lo Contador:</strong> 08:00 a 17:00 horas de lunes a jueves y de 08:00 a 16:00 horas los
                      viernes
                    </li>
                  </ul>

                  <h4 className="font-bold mb-4">¿Qué pasa si me siento enfermo, pero no es una emergencia?</h4>
                  <p className="mb-6">
                    Si estás en <strong>Campus San Joaquín, Campus Lo Contador, Campus Oriente o Casa Central</strong>{" "}
                    puedes pedir una <strong>hora de atención médica en el Centro Médico San Joaquín</strong> a través
                    de la web{" "}
                    <Link
                      className="text-yellow-300 underline font-bold"
                      href="https://agenda.ucchristus.cl/"
                      target="_blank"
                    >
                      https://agenda.ucchristus.cl/
                    </Link>
                    .{" "}
                    <strong>
                      Las especialidades de Ginecología, Traumatología, Medicina Familiar y Oftalmología tienen un 100%
                      de cobertura, y el resto de especialidades un 50%. Esto se hace efectivo al colocar tu huella
                      digital en el lector en el momento del pago en caja.
                    </strong>
                  </p>

                  <h4 className="font-bold mb-4">
                    ¿Qué debo hacer si me ocurre un accidente mientras me traslado a la Universidad?
                  </h4>
                  <p className="mb-4">
                    Puedes acudir al{" "}
                    <strong>Servicio de Urgencia del Hospital Clínico UC o a la Emergencia de San Joaquín,</strong> y{" "}
                    <strong>solicitar tu &quot;carta de resguardo&quot;</strong> a{" "}
                    <Link className="text-yellow-300 underline font-bold" href="mailto:saludybienestar@uc.cl">
                      saludybienestar@uc.cl
                    </Link>{" "}
                    para optar al beneficio del 100% de la atención médica de urgencia. No tienen cobertura{" "}
                    <strong>insumos de farmacia, procedimientos ni exámenes.</strong>
                  </p>
                  <p className="mb-6">
                    Si estás en <strong>Campus Villarrica</strong>, dirígete al{" "}
                    <strong>
                      hospital público más cercano y avisa a tu docente para hacer uso del &quot;Seguro Escolar
                      Estatal&quot;.
                    </strong>
                  </p>
                </div>
              )}
            </div>

            {/* Sección Académico */}
            <div className="bg-primary rounded-lg border-2 border-secondary text-white w-full mb-6">
              <button
                onClick={() => toggleSection("academico")}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-opacity-80 transition-colors"
              >
                <h3 className="text-xl font-bold">Soy Académico</h3>
                <span className="text-2xl">{expandedSection === "academico" ? "−" : "+"}</span>
              </button>
              {expandedSection === "academico" && (
                <div className="px-6 pb-6 border-t border-secondary">
                  <h4 className="font-bold mb-4 mt-4">¿Qué hago si un estudiante sufre una emergencia en mi clase?</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                    <li className="mb-3">
                      <strong>Llamar:</strong>
                    </li>
                    <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                      <li>
                        desde teléfonos fijos UC, llame al <strong>anexo 5000</strong>
                      </li>
                      <li>
                        desde <strong>celulares</strong> al{" "}
                        <Link className="text-yellow-300 underline font-bold" href="tel:+56955045000">
                          +56 9 5504 5000
                        </Link>
                      </li>
                    </ul>
                    <li className="mb-4">
                      <strong>
                        Quédese en su sala de clases y espere que el equipo de emergencias de salud y/o el encargado de
                        vigilancia lleguen al lugar, para recibir indicaciones.
                      </strong>
                    </li>
                  </ul>
                  <h4 className="font-bold mb-4">
                    ¿Qué hago si he sufrido un accidente en mi lugar de trabajo y/o me diagnostican una enfermedad
                    profesional?
                  </h4>
                  <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                    <li className="mb-4">
                      En caso de haber sufrido un accidente en el trabajo, usted u otra persona debe avisar{" "}
                      <strong>en forma inmediata a su jefe directo</strong> o reemplazante.
                    </li>

                    <li className="mb-4">
                      El jefe directo o reemplazante debe <strong>llamar telefónicamente</strong> a la administración
                      Delegada de Accidentes del Trabajo, ADLAT ubicada en la calle Quito N°38, comuna de Santiago.
                      Siempre se debe llamar al ADLAT para recibir orientación y determinar dónde dirigir al
                      accidentado.
                    </li>

                    <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                      <li>
                        Teléfonos ADLAT:{" "}
                        <Link className="text-yellow-300 underline font-bold" href="tel:+56955046931">
                          +56 9 5504 6931
                        </Link>{" "}
                        –{" "}
                        <Link className="text-yellow-300 underline font-bold" href="tel:+56955042222">
                          +56 9 5504 2222
                        </Link>{" "}
                        –{" "}
                        <Link className="text-yellow-300 underline font-bold" href="tel:+56955042244">
                          +56 9 5504 2244
                        </Link>
                      </li>
                      <li className="mb-2">
                        <strong>Horario hábil</strong>: Lunes a jueves de 8:30 a 17:30 horas y viernes de 8:30 a 16:00
                        horas.
                      </li>
                    </ul>

                    <li className="mb-4">
                      Inmediatamente el jefe directo debe <strong>completar y enviar el </strong>
                      <Link
                        className="text-yellow-300 underline font-bold"
                        href="http://personas.uc.cl/seguridad-y-salud-en-el-trabajo/prevencion-de-riesgos/reporte-de-accidente-del-trabajo-o-enfermedad-profesional"
                      >
                        Reporte de Accidente{" "}
                      </Link>{" "}
                      (on-line). El reporte de accidente es enviado en forma automática a ADLAT y al Departamento de
                      Prevención de Riesgos.
                    </li>

                    <li className="mb-4">
                      Una vez recibido el reporte de accidente,{" "}
                      <strong>
                        el Departamento de Prevención de Riesgos iniciará el procedimiento para la investigación
                      </strong>{" "}
                      del accidente laboral.
                    </li>
                  </ul>
                  <p className="mb-4">
                    <strong>Paralelamente, si se encuentra en el campus, llamar al número de emergencias:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                    <li>
                      desde teléfonos fijos en la UC al <strong>anexo 5000</strong>
                    </li>
                    <li>
                      desde <strong>celulares</strong> al{" "}
                      <Link className="text-yellow-300 underline font-bold" href="tel:+56955045000">
                        +56 9 5504 5000
                      </Link>
                    </li>
                  </ul>

                  <p>
                    <strong>
                      Quédese donde está y espere que el personal de salud y/o el encargado de vigilancia lleguen al
                      lugar.
                    </strong>
                  </p>
                </div>
              )}
            </div>

            {/* Sección Funcionario */}
            <div className="bg-primary rounded-lg border-2 border-secondary text-white w-full">
              <button
                onClick={() => toggleSection("funcionario")}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-opacity-80 transition-colors"
              >
                <h3 className="text-xl font-bold">Soy Funcionario</h3>
                <span className="text-2xl">{expandedSection === "funcionario" ? "−" : "+"}</span>
              </button>
              {expandedSection === "funcionario" && (
                <div className="px-6 pb-6 border-t border-secondary">
                  <h4 className="font-bold mb-4 mt-4">
                    ¿Qué hacer en caso de accidente del trabajo y/o enfermedad profesional?
                  </h4>
                  <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                    <li className="mb-4">
                      En caso de haber sufrido un accidente en el trabajo, usted u otra persona debe{" "}
                      <strong>avisar en forma inmediata a su jefe directo</strong> o reemplazante
                    </li>

                    <li className="mb-4">
                      El jefe directo o reemplazante debe <strong>llamar telefónicamente</strong> a la administración
                      Delegada de Accidentes del Trabajo, ADLAT ubicada en la calle Quito N°38, comuna de Santiago.
                      Siempre se debe llamar al ADLAT para recibir orientación y determinar dónde dirigir al
                      accidentado.
                    </li>

                    <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                      <li className="mb-2">
                        Teléfonos:{" "}
                        <Link className="text-yellow-300 underline font-bold" href="tel:+56955046931">
                          +56 9 5504 6931
                        </Link>{" "}
                        –{" "}
                        <Link className="text-yellow-300 underline font-bold" href="tel:+56955042222">
                          +56 9 5504 2222
                        </Link>{" "}
                        –{" "}
                        <Link className="text-yellow-300 underline font-bold" href="tel:+56955042244">
                          +56 9 5504 2244
                        </Link>
                      </li>
                      <li className="font-bold mb-2">
                        Horario hábil: Lunes a jueves de 8:30 a 17:30 horas y viernes de 8:30 a 16:00 horas.
                      </li>
                    </ul>

                    <li className="mb-4">
                      Inmediatamente el jefe directo debe <strong>completar y enviar el </strong>
                      <Link
                        className="text-yellow-300 underline font-bold"
                        href="http://personas.uc.cl/seguridad-y-salud-en-el-trabajo/prevencion-de-riesgos/reporte-de-accidente-del-trabajo-o-enfermedad-profesional"
                      >
                        Reporte de Accidente{" "}
                      </Link>{" "}
                      (on-line). El reporte de accidente es enviado en forma automática a ADLAT y al Departamento de
                      Prevención de Riesgos.
                    </li>

                    <li className="mb-4">
                      Una vez recibido el reporte de accidente,{" "}
                      <strong>
                        el Departamento de Prevención de Riesgos iniciará el procedimiento para la investigación
                      </strong>{" "}
                      del accidente laboral.
                    </li>
                  </ul>
                  <p className="mb-4">
                    <strong>Paralelamente, si se encuentra en el campus, llamar al número de emergencias:</strong>
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
                    <li>
                      desde teléfonos fijos en la UC al <strong>anexo 5000</strong>
                    </li>
                    <li>
                      desde <strong>celulares</strong> al{" "}
                      <Link className="text-yellow-300 underline font-bold" href="tel:+56955045000">
                        +56 9 5504 5000
                      </Link>
                    </li>
                  </ul>

                  <p>
                    <strong>
                      Quédese donde está y espere que el personal de salud y/o el encargado de vigilancia lleguen al
                      lugar.
                    </strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export const runtime = "edge";
