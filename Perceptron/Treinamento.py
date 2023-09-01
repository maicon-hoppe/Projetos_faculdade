from typing import List, Dict
from collections import Counter

import numpy as np


ru = 1234567

# Permite registar o resultado do cálculo de cada amostra
acertos_e_erros: List[bool] = []

# Define o viés e todos os pesos iniciais como 1
pesos = np.ones([1, 7], dtype=np.int32).flatten()
vies = 1

print('Pesos originais: ', pesos)

# Gera um array aleatório de 50 linhas de 7 dígitos, cada linha é um RU
np.random.seed(42)
amostras = np.random.randint(0, 9, size=[50, 7], dtype=np.int32)

for amostra in amostras:

    # Define o valor da amostra como um número
    amostra_ru = int(''.join(map(str, amostra)))

    resultado_esperado = -1 if amostra_ru < ru else 1

    # Função somatória dos valores de entrada
    soma_amostra = np.sum(amostra * pesos) + vies

    # Função de ativação
    if soma_amostra >= 0:
        resultado_obtido = 1
    else:
        resultado_obtido = -1

    acertos_e_erros.append(resultado_obtido == resultado_esperado)
    erro_amostral = resultado_esperado - resultado_obtido
    taxa_aprendizagem = 0.12

    # Se houver erro amostral
    if erro_amostral:

        # Deltas gerados pela amostra
        deltas = taxa_aprendizagem * erro_amostral * amostra

        # Atualiza os pesos
        pesos = pesos + deltas

print(f'Novos pesos: {pesos}')
print('=' * 56)

erro_total: Dict[bool, int] = Counter(acertos_e_erros)
print(f'Erro amostral total: {erro_total[False]}')
