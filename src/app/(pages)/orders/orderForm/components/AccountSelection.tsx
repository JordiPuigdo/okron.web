import { useEffect, useState } from 'react';
import { Account } from 'app/interfaces/Account';
import { AccountService } from 'app/services/accountService';

interface AccountSelectionProps {
  onSelectedAccount: (Account: Account) => void;
  selectedId?: string;
}

export default function AccountSelection({
  onSelectedAccount,
  selectedId,
}: AccountSelectionProps) {
  const accountService = new AccountService();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const accountFetched = await accountService.getAll();
        setAccounts(accountFetched.filter(x => x.active == true));
        if (accountFetched.length > 0) {
          if (selectedId)
            onSelectedAccount(accountFetched.find(x => x.id === selectedId)!);
          else onSelectedAccount(accountFetched[0]);
        }
      } catch (error) {
        console.error('Error fetching cost centers:', error);
      }
    }

    fetchAccounts();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-semibold">Compta Comptable:</label>
      <select
        className="w-full p-2 border rounded-md"
        value={accounts.find(x => x.id === selectedId)?.id}
        onChange={e => {
          const selectedAccount = e.target.value;
          onSelectedAccount(accounts.find(x => x.id === selectedAccount)!);
        }}
      >
        {accounts.map(Account => (
          <option key={Account.id} value={Account.id}>
            {Account.code} - {Account.description}
          </option>
        ))}
      </select>
    </div>
  );
}
