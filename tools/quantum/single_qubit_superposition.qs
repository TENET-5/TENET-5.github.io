import Std.Diagnostics.*;
import Std.Measurement.*;

@EntryPoint()
operation Main() : Result {
    Message("TENET5 quantum demo: single-qubit superposition measurement.");

    use q = Qubit();
    H(q);

    let result = MResetZ(q);
    Message($"Measured result: {result}");
    return result;
}
