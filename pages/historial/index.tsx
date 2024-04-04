import { useEffect, useState } from "react";
import supabase from "../api/supabase";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import Head from "next/head";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import Pagination from "@mui/material/Pagination";
import { Cliente } from "@/types/Cliente";
import { Proveedor } from "@/types/Proveedor";


export default function Historial() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pageCliente, setPageCliente] = useState(1);
  const [pageProveedor, setPageProveedor] = useState(1);
  const dataPerPage = 10;

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from("cliente")
          .select("*");

        if (clientesError) console.error(clientesError);
        else {
          setClientes(clientesData || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchProveedor = async () => {
      try {
        const { data: proveedorData, error: proveedorError } = await supabase
          .from("proveedor")
          .select("*");

        if (proveedorError) console.error(proveedorError);
        else {
          setTimeout(() => {
            setLoading(false);
          }, 1200);
          setProveedores(proveedorData || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchClientes();
    fetchProveedor();
  }, []);

  const clientesOdenados = clientes
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const proveedoresOdenados = proveedores
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const paginatedClientes = clientesOdenados.slice(
    (pageCliente - 1) * dataPerPage,
    pageCliente * dataPerPage
  );

  const paginatedProveedores = proveedoresOdenados.slice(
    (pageProveedor - 1) * dataPerPage,
    pageProveedor * dataPerPage
  );

  return (
    <>
      <Head>
        <title>Historial</title>
      </Head>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <main className="min-h-screen flex flex-col mt-[60px] ">
          <section className="p-8">
            <h1 className="text-4xl font-bold">Historial</h1>
          </section>
          <section className="flex flex-wrap gap-3 justify-center items-center w-screen">
            <article className="flex flex-col items-center m-3 gap-2">
              <Table
                aria-label="Example static collection table"
                className="w-[345px] m-2 md:w-[450px]"
              >
                <TableHeader>
                  <TableColumn className="text-base">Cliente</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginatedClientes.map((cliente) => (
                    <TableRow
                      key={cliente.id}
                      onClick={async () => {
                        await router.push(`historial/cliente/${cliente.id}`);
                      }}
                      className="cursor-pointer hover:bg-[#F4F4F5]  transition-all ease-in-out duration-300"
                    >
                      <TableCell>{cliente.nombre}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                count={Math.ceil(clientes.length / dataPerPage)}
                page={pageCliente}
                onChange={(_, value) => setPageCliente(value)}
              />
            </article>
            <article className="flex flex-col items-center m-3 gap-2">
              <Table
                aria-label="Example static collection table"
                className="w-[345px] m-2 md:w-[450px]"
              >
                <TableHeader>
                  <TableColumn className="text-base">Proveedor</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginatedProveedores.map((proveedor) => (
                    <TableRow
                      key={proveedor.id}
                      onClick={async () => {
                        await router.push(
                          `historial/proveedor/${proveedor.id}`
                        );
                      }}
                      className="cursor-pointer hover:bg-[#F4F4F5]  transition-all ease-in-out duration-300"
                    >
                      <TableCell>{proveedor.nombre}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                count={Math.ceil(proveedores.length / dataPerPage)}
                page={pageProveedor}
                onChange={(_, value) => setPageProveedor(value)}
              />
            </article>
          </section>
        </main>
      )}
    </>
  );
}
