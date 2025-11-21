import { useEffect, useState, useRef } from "react"
import AddFornecedoresForm from "./AddFornecedoresForm";

type Fornecedor = {
    id?: string;
    name: string;
    cnpj: string;
    email: string;
    description?: string;
    [key: string]: any;
};

export default function ListagemFornecedores() {
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
    const [cloneFornecedores, setCloneFornecedores] = useState<Fornecedor[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [fornecedorEditando, setFornecedorEditando] = useState<Fornecedor | undefined>(undefined);
    const [jsonText, setJsonText] = useState('');
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<keyof Fornecedor | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const exampleJson = `[
        {
            "name": "Empresa Exemplo LTDA",
            "cnpj": "12.345.678/0001-90",
            "email": "contato@exemplo.com",
            "description": "Empresa especializada em tecnologia"
        },
        {
            "name": "Fornecedor ABC",
            "cnpj": "98.765.432/0001-10",
            "email": "abc@fornecedor.com",
            "description": "Fornecedor de materiais"
        }
    ]`;

    const filteredFornecedores = fornecedores.filter(fornecedor => {
        const term = searchTerm.toLowerCase().trim();

        if (!term) return true;

        if (fornecedor.name && fornecedor.name.toLowerCase().includes(term)) {
            return true;
        }

        if (fornecedor.email && fornecedor.email.toLowerCase().includes(term)) {
            return true;
        }

        if (fornecedor.cnpj) {
            const cnpjNumbers = fornecedor.cnpj.replace(/[^\d]/g, '');
            const searchNumbers = term.replace(/[^\d]/g, '');
            if (cnpjNumbers.includes(searchNumbers) || fornecedor.cnpj.toLowerCase().includes(term)) {
                return true;
            }
        }

        if (fornecedor.description && fornecedor.description.toLowerCase().includes(term)) {
            return true;
        }

        return false;
    });

    // Aplicar ordenação
    const sortedFornecedores = [...filteredFornecedores].sort((a, b) => {
        if (!sortField) return 0;

        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';

        // Converter para string para comparação
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();

        if (aStr < bStr) {
            return sortDirection === 'asc' ? -1 : 1;
        }
        if (aStr > bStr) {
            return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const handleSort = (field: keyof Fornecedor) => {
        if (sortField === field) {
            // Se já está ordenando por este campo, inverte a direção
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Novo campo, começa com ascendente
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: keyof Fornecedor) => {
        if (sortField !== field) {
            return (
                <svg className="h-3 w-3 text-gray-400" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.13347 0.0999756H2.98516L5.01902 4.79058H3.86226L3.45549 3.79907H1.63772L1.24366 4.79058H0.0996094L2.13347 0.0999756ZM2.54025 1.46012L1.96822 2.92196H3.11227L2.54025 1.46012Z" fill="currentColor" stroke="currentColor" strokeWidth="0.1" />
                    <path d="M0.722656 9.60832L3.09974 6.78633H0.811638V5.87109H4.35819V6.78633L2.01925 9.60832H4.43446V10.5617H0.722656V9.60832Z" fill="currentColor" stroke="currentColor" strokeWidth="0.1" />
                    <path d="M8.45558 7.25664V7.40664H8.60558H9.66065C9.72481 7.40664 9.74667 7.42274 9.75141 7.42691C9.75148 7.42808 9.75146 7.42993 9.75116 7.43262C9.75001 7.44265 9.74458 7.46304 9.72525 7.49314C9.72522 7.4932 9.72518 7.49326 9.72514 7.49332L7.86959 10.3529L7.86924 10.3534C7.83227 10.4109 7.79863 10.418 7.78568 10.418C7.77272 10.418 7.73908 10.4109 7.70211 10.3534L7.70177 10.3529L5.84621 7.49332C5.84617 7.49325 5.84612 7.49318 5.84608 7.49311C5.82677 7.46302 5.82135 7.44264 5.8202 7.43262C5.81989 7.42993 5.81987 7.42808 5.81994 7.42691C5.82469 7.42274 5.84655 7.40664 5.91071 7.40664H6.96578H7.11578V7.25664V0.633865C7.11578 0.42434 7.29014 0.249976 7.49967 0.249976H8.07169C8.28121 0.249976 8.45558 0.42434 8.45558 0.633865V7.25664Z" fill="currentColor" stroke="currentColor" strokeWidth="0.3" />
                </svg>
            );
        }

        return sortDirection === 'asc' ? (
            <svg className="h-3 w-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="h-3 w-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const validateFornecedorStructure = (obj: any): obj is Fornecedor => {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            typeof obj.name === 'string' &&
            typeof obj.cnpj === 'string' &&
            typeof obj.email === 'string' &&
            typeof obj.description === 'string'
        );
    };

    // Função para importar JSON
    // Função para importar JSON
    // Função para importar JSON
    const handleImportJson = async () => {
        try {
            setImportError(null);

            if (!jsonText.trim()) {
                setImportError('Por favor, insira um JSON válido');
                return;
            }

            const data = JSON.parse(jsonText);

            if (!Array.isArray(data)) {
                setImportError('O JSON deve ser um array de fornecedores');
                return;
            }

            if (data.length === 0) {
                setImportError('O array não pode estar vazio');
                return;
            }

            const invalidItems = data.filter((item) => !validateFornecedorStructure(item));
            if (invalidItems.length > 0) {
                setImportError(`Estrutura inválida encontrada em ${invalidItems.length} item(s). Cada fornecedor deve ter: name, cnpj, email e opcionalmente description`);
                return;
            }

            

            // Usar o endpoint de importação em lote
            const response = await fetch('http://localhost:8080/neostore/api/fornecedores/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || 'Erro ao importar fornecedores';
                } catch {
                    errorMessage = `Erro HTTP ${response.status}: ${errorText}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            

            // Recarregar a lista de fornecedores após importação
            const listResponse = await fetch('http://localhost:8080/neostore/api/fornecedores/');
            if (listResponse.ok) {
                const updatedFornecedores = await listResponse.json();
                const processedData = updatedFornecedores.map((fornecedor: Fornecedor) => ({
                    ...fornecedor,
                    description: fornecedor.description && fornecedor.description.length > 50
                        ? fornecedor.description.slice(0, 20) + '...'
                        : fornecedor.description
                }));
                setFornecedores(processedData);
                setCloneFornecedores(updatedFornecedores)
            }

            setShowImportModal(false);
            setJsonText('');
            alert(`Fornecedores importados com sucesso!`);

        } catch (e) {
            
            if (e instanceof SyntaxError) {
                setImportError('JSON inválido. Verifique a sintaxe.');
            } else {
                setImportError(e instanceof Error ? e.message : 'Erro desconhecido na importação.');
            }
        }
    };


    // Função para importar arquivo JSON
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/json') {
            setImportError('Por favor, selecione um arquivo JSON válido');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setJsonText(content);
        };
        reader.readAsText(file);
    };

    // Função para fechar modal de importação
    const closeImportModal = () => {
        setShowImportModal(false);
        setJsonText('');
        setImportError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        const fetchFornecedores = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:8080/neostore/api/fornecedores/');

                if (!response.ok) {
                    throw new Error(`Erro HTTP! Status ${response.status}`);
                }

                const data = await response.json();
                

                // Process descriptions here
                const processedData = data.map((fornecedor: Fornecedor) => ({
                    ...fornecedor,
                    description: fornecedor.description && fornecedor.description.length > 50
                        ? fornecedor.description.slice(0, 30) + '...'
                        : fornecedor.description
                }));

                setCloneFornecedores(data);

                setFornecedores(processedData);
            } catch (e) {
                
                setError(e instanceof Error ? e.message : 'Erro desconhecido');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFornecedores();
    }, []);

    const totalPages = Math.ceil(sortedFornecedores.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFornecedores = sortedFornecedores.slice(startIndex, endIndex);

    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleEdit = (e: React.MouseEvent, fornecedor: Fornecedor) => {
        e.stopPropagation(); // Evita o clique na linha
        const foundFornecedor = cloneFornecedores.find(f => f.id === fornecedor.id);
        console.log('Editando fornecedor:', foundFornecedor); // Para debug
        setFornecedorEditando(foundFornecedor);
        setShowForm(true);
    };

    // Funções de navegação
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Reset para primeira página quando os fornecedores mudarem
    useEffect(() => {
        setCurrentPage(1);
    }, [fornecedores.length]);

    const handleRowClick = (fornecedor: Fornecedor) => {
        const foundFornecedor = cloneFornecedores.find(f => f.id === fornecedor.id);
        console.log('Clique na linha - fornecedor:', foundFornecedor); // Para debug
        setFornecedorEditando(foundFornecedor);
        setShowForm(true);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Evita o clique na linha
        

        if (window.confirm('Tem certeza que deseja deletar este fornecedor?')) {
            try {
                const response = await fetch(`http://localhost:8080/neostore/api/fornecedores/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                

                if (!response.ok) {
                    const errorData = await response.text();
                    
                    throw new Error(`Erro ao deletar fornecedor: ${errorData}`);
                }

                setFornecedores(prev => prev.filter(f => f.id !== id));
                
                alert('Fornecedor deletado com sucesso!');
            } catch (error) {
                
                alert('Erro ao deletar fornecedor. Tente novamente.');
            }
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setFornecedorEditando(undefined);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Carregando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-red-600">Erro: {error}</div>
            </div>
        );
    }

    return (
        <section className="container px-4 mx-auto">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-x-3">
                        <h2 className="text-lg font-medium text-gray-800">Fornecedores</h2>
                        <span className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full">
                            {sortedFornecedores.length} fornecedores
                            {searchTerm && sortedFornecedores.length !== fornecedores.length &&
                                <span className="text-gray-500"> de {fornecedores.length}</span>
                            }
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Página {currentPage} de {totalPages || 1} • Mostrando {currentFornecedores.length} de {sortedFornecedores.length} fornecedores
                        {searchTerm && <span className="text-blue-600"> • Filtrado por: "{searchTerm}"</span>}
                        {sortField && <span className="text-green-600"> • Ordenado por: {sortField} ({sortDirection === 'asc' ? 'A-Z' : 'Z-A'})</span>}
                    </p>
                </div>

                <div className="flex items-center mt-4 gap-x-3">
                    <button onClick={() => setShowImportModal(true)}
                        className="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto hover:bg-gray-100">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_3098_154395)">
                                <path d="M13.3333 13.3332L9.99997 9.9999M9.99997 9.9999L6.66663 13.3332M9.99997 9.9999V17.4999M16.9916 15.3249C17.8044 14.8818 18.4465 14.1806 18.8165 13.3321C19.1866 12.4835 19.2635 11.5359 19.0351 10.6388C18.8068 9.7417 18.2862 8.94616 17.5555 8.37778C16.8248 7.80939 15.9257 7.50052 15 7.4999H13.95C13.6977 6.52427 13.2276 5.61852 12.5749 4.85073C11.9222 4.08295 11.104 3.47311 10.1817 3.06708C9.25943 2.66104 8.25709 2.46937 7.25006 2.50647C6.24304 2.54358 5.25752 2.80849 4.36761 3.28129C3.47771 3.7541 2.70656 4.42249 2.11215 5.23622C1.51774 6.04996 1.11554 6.98785 0.935783 7.9794C0.756025 8.97095 0.803388 9.99035 1.07431 10.961C1.34523 11.9316 1.83267 12.8281 2.49997 13.5832" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_3098_154395">
                                    <rect width="20" height="20" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <span>Importar JSON</span>
                    </button>

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex cursor-pointer items-center justify-center w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-blue-500 rounded-lg shrink-0 sm:w-auto gap-x-2 hover:bg-blue-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Adicionar Fornecedor</span>
                    </button>
                </div>
            </div>

            <div className="mt-6 md:flex md:items-center md:justify-between">
                <div className="relative flex items-center mt-4 md:mt-0">
                    <span className="absolute left-0 pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por CNPJ"
                        className="block w-full py-2 pr-12 text-gray-700 bg-white border border-gray-200 rounded-lg md:w-80 placeholder-gray-400/70 pl-10 focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-0 pr-3 text-gray-400 hover:text-gray-600"
                            title="Limpar busca"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Mostra quantos resultados foram encontrados */}                    {searchTerm && (
                        <div className="mt-4 md:mt-0">
                            <span className="text-sm text-gray-500">
                                {sortedFornecedores.length === 0 ? (
                                    <span className="text-red-600">Nenhum fornecedor encontrado</span>
                                ) : (
                                    <span className="text-green-600">
                                        {sortedFornecedores.length} fornecedor(es) encontrado(s)
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
            </div>

                {/* Mensagem quando não há resultados */}
            {searchTerm && sortedFornecedores.length === 0 && (
                <div className="mt-6 text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum fornecedor encontrado</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        Não encontramos fornecedores que correspondem ao termo "{searchTerm}".
                    </p>
                    <div className="mt-4">
                        <button
                            onClick={clearSearch}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Limpar busca
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col mt-6">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden border border-gray-200 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500">
                                            <button 
                                                onClick={() => handleSort('name')}
                                                className="flex items-center gap-x-3 focus:outline-none hover:text-gray-700 transition-colors"
                                            >
                                                <span>Nome</span>
                                                {getSortIcon('name')}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-12 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                                            <button 
                                                onClick={() => handleSort('cnpj')}
                                                className="flex items-center gap-x-3 focus:outline-none hover:text-gray-700 transition-colors"
                                            >
                                                <span>CNPJ</span>
                                                {getSortIcon('cnpj')}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                                            <button 
                                                onClick={() => handleSort('email')}
                                                className="flex items-center gap-x-3 focus:outline-none hover:text-gray-700 transition-colors"
                                            >
                                                <span>Email</span>
                                                {getSortIcon('email')}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                                            <button 
                                                onClick={() => handleSort('description')}
                                                className="flex items-center gap-x-3 focus:outline-none hover:text-gray-700 transition-colors"
                                            >
                                                <span>Descrição</span>
                                                {getSortIcon('description')}
                                            </button>
                                        </th>
                                        <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentFornecedores.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-16 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-400">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        {searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mb-4">
                                                        {searchTerm
                                                            ? `Não há fornecedores que correspondem ao termo "${searchTerm}"`
                                                            : 'Comece adicionando seu primeiro fornecedor ou importe dados via JSON'
                                                        }
                                                    </p>
                                                    <div className="flex gap-3">
                                                        {searchTerm ? (
                                                            <button
                                                                onClick={clearSearch}
                                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                                Limpar busca
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => setShowForm(true)}
                                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    Adicionar Fornecedor
                                                                </button>
                                                                <button
                                                                    onClick={() => setShowImportModal(true)}
                                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-2">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                                                    </svg>
                                                                    Importar JSON
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        currentFornecedores.map((fornecedor: Fornecedor, idx: number) => (
                                            <tr
                                                key={fornecedor.id || idx}
                                                onClick={() => handleRowClick(fornecedor)}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                            >
                                                <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                                                    <div>
                                                        <h2 className="font-medium text-gray-800">{fornecedor.name}</h2>
                                                    </div>
                                                </td>
                                                <td className="px-12 py-4 text-sm font-medium whitespace-nowrap">
                                                    <div className="inline px-3 py-1 text-sm font-normal rounded-full text-emerald-500 gap-x-2 bg-emerald-100/60">
                                                        {fornecedor.cnpj}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm whitespace-nowrap">
                                                    <div>
                                                        <h4 className="text-gray-700">{fornecedor.email}</h4>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm whitespace-nowrap">
                                                    <div>
                                                        <p className="text-gray-700">{fornecedor.description || ''}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm whitespace-nowrap">
                                                    <div className="flex items-center gap-x-2">
                                                        <button
                                                            onClick={(e) => handleEdit(e, fornecedor)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                                            title="Editar fornecedor"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                if (fornecedor.id) {
                                                                    handleDelete(e, fornecedor.id);
                                                                } else {
                                                                    e.stopPropagation();
                                                                    
                                                                    alert('Erro: ID do fornecedor não encontrado');
                                                                }
                                                            }}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                            title="Deletar fornecedor"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 sm:flex sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                    Mostrando <span className="font-medium text-gray-700">{startIndex + 1}</span> até{' '}
                    <span className="font-medium text-gray-700">{Math.min(endIndex, fornecedores.length)}</span> de{' '}
                    <span className="font-medium text-gray-700">{fornecedores.length}</span> fornecedores
                </div>

                <div className="flex items-center mt-4 gap-x-4 sm:mt-0">
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md sm:w-auto gap-x-2 ${currentPage === 1
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:bg-gray-100 cursor-pointer'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 rtl:-scale-x-100">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                        </svg>
                        <span>Anterior</span>
                    </button>

                    {/* Números das páginas */}
                    <div className="flex items-center gap-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={`flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 capitalize transition-colors duration-200 bg-white border rounded-md sm:w-auto gap-x-2 ${currentPage === totalPages || totalPages === 0
                                ? 'cursor-not-allowed opacity-50'
                                : 'hover:bg-gray-100 cursor-pointer'
                            }`}
                    >
                        <span>Próximo</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 rtl:-scale-x-100">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                    </button>
                </div>
            </div>
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto relative">
                        <button
                            onClick={closeImportModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Importar Fornecedores via JSON
                        </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Selecionar arquivo JSON:
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileImport}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-700 mb-2">
                                Ou cole o JSON aqui:
                            </label>
                            <textarea
                                id="jsonInput"
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                rows={10}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                placeholder="Cole seu JSON aqui..."
                            />
                        </div>

                        {importError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{importError}</p>
                            </div>
                        )}

                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Exemplo de formato JSON:</h3>
                            <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                                {exampleJson}
                            </pre>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeImportModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleImportJson}
                                disabled={!jsonText.trim() }
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${jsonText.trim()
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Importar
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
                        <button
                            onClick={closeForm}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                        <AddFornecedoresForm
                            fornecedor={fornecedorEditando}
                            onSave={async (form: Fornecedor) => {
                                try {
                                    const isEdit = fornecedorEditando?.id;
                                    

                                    const response = await fetch(
                                        isEdit
                                            ? `http://localhost:8080/neostore/api/fornecedores/${fornecedorEditando.id}`
                                            : 'http://localhost:8080/neostore/api/fornecedores/',
                                        {
                                            method: isEdit ? 'PUT' : 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(form),
                                        }
                                    );

                                    if (!response.ok) {
                                        const errorData = await response.text();
                                        throw new Error(`Erro ao salvar fornecedor: ${errorData}`);
                                    }

                                    const savedFornecedor = await response.json();
                                    

                                    if (isEdit) {
                                        // Atualizar fornecedor existente
                                        setFornecedores(prev => prev.map(f =>
                                            f.id === fornecedorEditando.id ? {
                                                ...savedFornecedor,
                                                description: savedFornecedor.description && savedFornecedor.description.length > 50
                                                    ? savedFornecedor.description.slice(0, 20) + '...'
                                                    : savedFornecedor.description
                                            } : f
                                        ));
                                    } else {
                                        // Adicionar novo fornecedor
                                        const processedFornecedor = {
                                            ...savedFornecedor,
                                            description: savedFornecedor.description && savedFornecedor.description.length > 50
                                                ? savedFornecedor.description.slice(0, 20) + '...'
                                                : savedFornecedor.description
                                        };
                                        setFornecedores(prev => [...prev, processedFornecedor]);
                                    }

                                    closeForm();
                                } catch (error) {
                                    
                                    alert(`Erro ao salvar fornecedor: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        </section>
    )
}