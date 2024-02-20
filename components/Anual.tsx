export default function Anual() {
  return (
    <>
      <section className="bg-white p-4 w-[95%] max-w-[1190px] shadow-md rounded-md">
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Subtotal</td>
              <td>0.00</td>
            </tr>
            <tr>
              <td>IVA</td>
              <td>0.00</td>
            </tr>
            <tr>
              <td>Total</td>
              <td>0.00</td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
