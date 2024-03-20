import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/table";

export default function Anual() {
  return (
    <main>
      <h1>Anual</h1>
      <Table>
        <TableHeader>
          <TableColumn>Nombre</TableColumn>
          <TableColumn>Apellido</TableColumn>
          <TableColumn>Edad</TableColumn>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>Doe</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane</TableCell>
            <TableCell>Doe</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </main>
  );
}
