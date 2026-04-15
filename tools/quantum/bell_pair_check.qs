import Std.Diagnostics.*;
import Std.Measurement.*;

@EntryPoint()
operation Main() : (Result, Result) {
    Message("TENET5 quantum demo: Bell pair correlation check.");

    use (left, right) = (Qubit(), Qubit());
    H(left);
    CNOT(left, right);

    let rLeft = MResetZ(left);
    let rRight = MResetZ(right);

    Message($"Bell pair results: {rLeft}, {rRight}");
    return (rLeft, rRight);
}
