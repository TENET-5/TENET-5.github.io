import Std.Diagnostics.*;
import Std.Measurement.*;

operation PrepareLoomState(register : Qubit[]) : Unit is Adj + Ctl {
    H(register[0]);
    CNOT(register[0], register[1]);
    CNOT(register[1], register[2]);
    CNOT(register[2], register[3]);
    CNOT(register[3], register[4]);
}

@EntryPoint()
operation Main() : Result[] {
    Message("TENET5 quantum demo: five-qubit Loom coherence check.");

    use register = Qubit[5];
    PrepareLoomState(register);

    let results = MeasureEachZ(register);
    ResetAll(register);

    return results;
}
