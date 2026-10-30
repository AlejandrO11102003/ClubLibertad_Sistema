import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PanelBailarin from "./pages/PanelBailarin";
import Login from "./pages/Login";
import RegistroBailarin from "./pages/RegistroBailarin";
import Perfil from "./pages/Perfil";
import Concursos from "./pages/Concursos";
import DetalleConcurso from "./pages/DetalleConcurso";
import Resultados from "./pages/Resultados";
import PerfilPublico from "./pages/PerfilPublico";
import ComoFunciona from "./pages/ComoFunciona";
import Comunidad from "./pages/Comunidad";
import AdminConcursos from "./pages/AdminConcursos";
import AdminResultados from "./pages/AdminResultados";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminInscripciones from "./pages/admin/AdminInscripciones";
import AdminBailarines from "./pages/admin/AdminBailarines";
import AdminCategorias from "./pages/admin/AdminCategorias";
import SolicitarInscripcion from "./pages/SolicitarInscripcion";
import MisInscripciones from "./pages/MisInscripciones";
import MiPareja from "./pages/MiPareja";
import Notificaciones from "./pages/Notificaciones";
import Credenciales from "./pages/Credenciales";
import CredencialDetalle from "./pages/Credencial";
import RequireAuth from "./components/RequireAuth";
import PublicLayout from "./components/layout/PublicLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/panel"
          element={
            <RequireAuth rol="BAILARIN">
              <PanelBailarin />
            </RequireAuth>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<RegistroBailarin />} />
        <Route path="/registro-bailarin" element={<RegistroBailarin />} />

        <Route element={<PublicLayout />}>

          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <Perfil />
              </RequireAuth>
            }
          />

          <Route path="/concursos" element={<Concursos />} />
          <Route path="/concursos/:id" element={<DetalleConcurso />} />
          <Route path="/resultados" element={<Resultados />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/comunidad" element={<Comunidad />} />
          <Route path="/bailarines/:id" element={<PerfilPublico />} />

          <Route
            path="/inscripcion/:concursoId"
            element={
              <RequireAuth>
                <SolicitarInscripcion />
              </RequireAuth>
            }
          />
          <Route
            path="/inscripciones"
            element={
              <RequireAuth>
                <MisInscripciones />
              </RequireAuth>
            }
          />
          <Route
            path="/mi-pareja"
            element={
              <RequireAuth>
                <MiPareja />
              </RequireAuth>
            }
          />
          <Route
            path="/notificaciones"
            element={
              <RequireAuth>
                <Notificaciones />
              </RequireAuth>
            }
          />
          <Route
            path="/credencial"
            element={
              <RequireAuth>
                <Credenciales />
              </RequireAuth>
            }
          />
          <Route
            path="/credencial/:inscripcionId"
            element={
              <RequireAuth>
                <CredencialDetalle />
              </RequireAuth>
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAuth rol="ADMIN">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="concursos" element={<AdminConcursos />} />
          <Route path="resultados" element={<AdminResultados />} />
          <Route path="inscripciones" element={<AdminInscripciones />} />
          <Route path="bailarines" element={<AdminBailarines />} />
          <Route path="categorias" element={<AdminCategorias />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
