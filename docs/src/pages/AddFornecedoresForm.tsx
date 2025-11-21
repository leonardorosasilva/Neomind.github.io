import React, { useState, useEffect } from 'react';
import { cnpj } from 'cpf-cnpj-validator';

interface Fornecedor {
  id?: string;
  name: string;
  cnpj: string;
  email: string;
  description?: string;
}

interface AddFornecedoresFormProps {
  onSave: (data: Fornecedor) => void;
  fornecedor?: Fornecedor;
}

export default function AddFornecedoresForm({ onSave, fornecedor }: AddFornecedoresFormProps) {

  const [form, setForm] = useState<Fornecedor>({
    name: '',
    cnpj: '',
    email: '',
    description: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    cnpj: ''
  });

  useEffect(() => {
    if (fornecedor) {
      setForm({
        ...fornecedor,
        description: fornecedor.description || '', // Se for undefined/null, usar string vazia
      });
    } else {
      // Reset form when no fornecedor is provided
      setForm({
        name: '',
        cnpj: '',
        email: '',
        description: '',
      });
    }
    // Reset errors when fornecedor changes
    setErrors({ email: '', cnpj: '' });
  }, [fornecedor]);

  // Função para validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Função para validar CNPJ
  const validateCnpj = (cnpjValue: string): boolean => {
    return cnpj.isValid(cnpjValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Validação em tempo real
    if (id === 'email') {
      if (value && !validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: 'Email inválido' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }

    if (id === 'cnpj') {
      if (value && !validateCnpj(value)) {
        setErrors(prev => ({ ...prev, cnpj: 'CNPJ inválido' }));
      } else {
        setErrors(prev => ({ ...prev, cnpj: '' }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação final antes do submit
    const emailValid = !form.email || validateEmail(form.email);
    const cnpjValid = !form.cnpj || validateCnpj(form.cnpj);

    if (!emailValid || !cnpjValid) {
      setErrors({
        email: !emailValid ? 'Email inválido' : '',
        cnpj: !cnpjValid ? 'CNPJ inválido' : ''
      });
      return;
    }

    onSave(form);
  };

  // Verifica se o formulário é válido para habilitar/desabilitar o botão
  const isFormValid = () => {



    const hasRequiredFields = form.name.trim() && form.email.trim() && form.cnpj.trim();
    const hasNoErrors = !errors.email && !errors.cnpj;
    const emailValid = form.email ? validateEmail(form.email) : false;
    const cnpjValid = form.cnpj ? validateCnpj(form.cnpj) : false;






    const isValid = hasRequiredFields && hasNoErrors && emailValid && cnpjValid;


    return isValid;
  };
  return (
    <section className="max-w-4xl p-6 mx-auto bg-white rounded-md shadow-md">
      <h2 className="text-lg font-semibold text-gray-700 capitalize">
        {fornecedor ? 'Editando Fornecedor' : 'Adicionando Fornecedor'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-gray-700">Nome</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md 
                      focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className={`block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md 
                         focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring ${errors.email
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-200 focus:border-blue-400'
                }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="text-gray-700">Descrição</label>
            <textarea
              id="description"
              value={form.description || ''} // Garantir que nunca seja undefined
              onChange={handleChange}
              rows={3}
              className="resize-none block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md 
                         focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label htmlFor="cnpj" className="text-gray-700">CNPJ</label>
            <input
              id="cnpj"
              type="text"
              value={form.cnpj}
              onChange={handleChange}
              required
              placeholder="00.000.000/0000-00"
              className={`block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md 
                         focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring ${errors.cnpj
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-200 focus:border-blue-400'
                }`}
            />
            {errors.cnpj && (
              <p className="mt-1 text-sm text-red-600">{errors.cnpj}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            
            disabled={!isFormValid()}
            className={`px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform rounded-md focus:outline-none ${isFormValid()
                ? 'bg-blue-600 hover:bg-blue-500 focus:bg-blue-500 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            {fornecedor ? 'Salvar Alterações' : 'Salvar'}
          </button>
        </div>
      </form>
    </section>
  );
}