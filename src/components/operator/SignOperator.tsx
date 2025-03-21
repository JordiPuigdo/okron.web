'use client';
import { useState } from 'react';
import { SvgSearch } from 'app/icons/icons';
import { OperatorLogged } from 'app/interfaces/User';
import AuthenticationService from 'app/services/authentication';
import { useSessionStore } from 'app/stores/globalStore';

export default function SignOperator() {
  const { setOperatorLogged, operatorLogged } = useSessionStore(state => state);
  const [codeOperator, setCodeOperator] = useState('');
  const [errorSign, setErrorSign] = useState<string | undefined>('');

  const authService = new AuthenticationService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  function signOperator() {
    if (operatorLogged?.codeOperatorLogged) {
      setCodeOperator('');
      setOperatorLogged(undefined);
      if (codeOperator == '') return;
    }
    if (!/^\d+$/.test(codeOperator) || codeOperator == '') {
      setCodeOperator('');
      alert('Codi de operari només pot ser númeric');
      return;
    }
    authService
      .LoginOperator(codeOperator)
      .then(x => {
        if (x.id != undefined) {
          const op: OperatorLogged = {
            codeOperatorLogged: x.code,
            idOperatorLogged: x.id,
            nameOperatorLogged: x.name,
            operatorLoggedType: x.operatorType,
          };
          setOperatorLogged(op);
          setCodeOperator('');
        } else {
          setErrorSign('Operari no trobat!');
          setCodeOperator('');
          setTimeout(() => {
            setErrorSign(undefined);
          }, 4000);
        }
      })
      .catch(err => {
        setErrorSign(err);
      });
  }

  return (
    <div className="flex flex-col gap-4 ml-4">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Codi Operari"
          className="w-full pl-10 pr-24 py-2 text-sm rounded-md border border-gray-300 focus:outline-none"
          value={codeOperator}
          onChange={e => setCodeOperator(e.target.value)}
          onKeyUp={e => {
            if (e.key === 'Enter') {
              signOperator();
            }
          }}
        />
        <div className="absolute left-3 text-gray-500">
          <SvgSearch />
        </div>
        <button
          onClick={signOperator}
          className="absolute right-2 px-4 py-1 bg-okron-main text-white text-sm font-semibold rounded-md hover:bg-okron-hoverButtonMain"
        >
          {operatorLogged?.codeOperatorLogged ? 'Desfitxar' : 'Fitxar'}
        </button>
      </div>
      {errorSign && (
        <div className="flex px-2">
          <p className="text-red-500">{errorSign}</p>
        </div>
      )}
    </div>
  );
}
