import Std.Diagnostics.*;
import Std.Measurement.*;

@EntryPoint()
operation Main() : Result {
    Message("TENET5 quantum demo: phase kick and interference check.");

    use q = Qubit();
    H(q);
    Z(q);
    H(q);

    let result = MResetZ(q);
    Message($"Interference result: {result}");
    return result;
}
