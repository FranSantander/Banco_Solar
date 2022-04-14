const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgresql",
  database: "bancosolar",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 2000,
});

const guardarUsuario = async (usuario) => {
  const values = Object.values(usuario);
  const consulta = {
    text: "INSERT INTO usuarios (nombre, balance) values ($1, $2) RETURNING *",
    values,
  };
  try {
    const result = await pool.query(consulta);
    return result;
  } catch (error) {
    console.log(error.code);
    return error;
  }
};

const getUsuarios = async () => {
  try {
    const result = await pool.query("SELECT * FROM usuarios;");
    return result.rows;
  } catch (error) {
    console.log(error.code);
    return error;
  }
};
const editUsuario = async (usuario, id) => {
  console.log(usuario, id);
  const values = Object.values(usuario);
  const consulta = {
    text: `UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *`,
    values,
  };
  try {
    const result = await pool.query(consulta);
    return result;
  } catch (error) {
    console.log(error.code);
  }
};
const eliminarUsuario = async (id) => {
  try {
    const result = await pool.query(`DELETE FROM usuarios WHERE id = ${id}`);
    return result.rows;
  } catch (error) {
    console.log(error.code);
  }
};
const registrarTransferencias = async (transferencia) => {
  console.log(transferencia);
  const values = Object.values(transferencia);
  const nombreEmisor = values[0];
  const nombreReceptor = values[1];
  const monto = values[2];

  const registroTransferencia = {
    text: "INSERT INTO transferencias (emisor,receptor,monto,fecha) values ((SELECT id FROM usuarios WHERE nombre = $1), (SELECT id FROM usuarios WHERE nombre = $2), $3, current_timestamp)",
    values: [nombreEmisor, nombreReceptor, Number(monto)],
  };

  const actualizarBalanceEmisor = {
    text: "UPDATE usuarios SET balance = balance - $2 WHERE id = (SELECT id FROM usuarios WHERE nombre = $1);",
    values: [nombreEmisor, Number(monto)],
  };

  const actualizarBalanceReceptor = {
    text: "UPDATE usuarios SET balance = balance + $2 WHERE id = (SELECT id FROM usuarios WHERE nombre = $1);",
    values: [nombreReceptor, Number(monto)],
  };

  try {
    await pool.query("BEGIN");
    await pool.query(registroTransferencia);
    console.log("Se esta realizando la transferencia");
    await pool.query(actualizarBalanceEmisor);
    console.log("Cuenta del emisor actualizada");
    await pool.query(actualizarBalanceReceptor);
    console.log("Cuenta del receptor actualizada");
    await pool.query("COMMIT");
    //const rows = [actualizarBalanceEmisor.rows[0].nombre, actualizarBalanceReceptor.rows[0].nombre, transferencia[2]]
    return true;
  } catch (error) {
    await pool.query("ROLLBACK");
    console.log(
      "No se pudo realizar la transacción.",
      "Error de código: ",
      error.code
    );
    return error;
  }
};
/*const getTransferencias = async () => {
  const consulta = {
    text: `SELECT fecha,(SELECT nombre AS emisor FROM usuarios WHERE usuarios.id = transferencias.emisor),(SELECT nombre AS receptor FROM usuarios WHERE usuarios.id = transferencias.receptor), monto FROM transferencias INNER JOIN usuarios ON transferencias.emisor = usuarios.id`,
    rowMode: "array",
  };
  try {
    const result = await pool.query(consulta);
    return result.rows;
  } catch (error) {
    console.log(
      "Error al hacer la consulta de la transferencia",
      "Error de código: ",
      error.code
    );
    return error;
  }
};*/
const getTransferencias = async () => {
  //console.log(getTransferencias);
  const consulta = {
    text: `SELECT * FROM transferencias`,
    rowMode: "array",
  };
  try {
    const result = await pool.query(consulta);
    return result.rows;
  } catch (error) {
    console.log(
      "Error al hacer la consulta de la transferencia",
      "Error de código: ",
      error.code
    );
    return error;
  }
};

module.exports = {
  guardarUsuario,
  getUsuarios,
  editUsuario,
  eliminarUsuario,
  registrarTransferencias,
  getTransferencias,
};
