Certificados de Asistencia en Blockchain
Introducción al sistema
En este proyecto desarrollamos una solución para dar certificados digitales (NFT) que sean imposibles de falsificar. La idea es que si alguien va a una charla o taller, reciba un comprobante digital único.

A diferencia de lo que presentamos antes, ya no usamos POAP. Decidimos programar nuestro propio Smart Contract en Solidity. Así, nosotros controlamos todo el proceso, desde quién está autorizado hasta cómo se emite el certificado, cumpliendo con lo que se pidió para esta entrega técnica.

¿Cómo está armado el proyecto? (Arquitectura)
El sistema funciona con estos cuatro pilares:

Organizador: Es quien sube el contrato y dice quiénes son los asistentes autorizados (hace la lista blanca).

Smart Contract (Solidity): Es el corazón del proyecto. Valida que la persona de verdad esté en la lista y le entrega su token ERC-721.

Blockchain Local (Hardhat): Es nuestra red de pruebas. Aquí es donde corre todo el código sin gastar dinero real.

Asistente: El usuario que usa su wallet para reclamar el certificado.

Flujo de lo que pasa en la red
Para que un certificado llegue a una wallet, pasa esto:

Primero, subimos el contrato Certificado.sol a Hardhat.

El organizador mete las direcciones de las billeteras autorizadas al contrato.

El asistente pide su certificado con la función reclamar.

El contrato revisa que todo esté en orden y hace el "mint" (la creación) del NFT directamente a la wallet del usuario.
sequenceDiagram
    participant O as Organizador
    participant SC as Smart Contract (Propio)
    participant U as Usuario
    participant B as Blockchain Local
    O->>SC: Subir Contrato
    O->>SC: Autorizar Wallets (Whitelist)
    U->>SC: Reclamar Certificado
    SC->>SC: Validar Autorización
    SC->>B: Mintear NFT (ERC-721)
    B-->>U: Certificado enviado a Wallet
    Diagramas de funcionamiento
    flowchart LR
    A[Organizador] --> B[Carga de Lista Blanca]
    B --> C[Smart Contract Propio]
    D[Asistente] --> E[Reclamo de Certificado]
    E --> C
    C --> F[Blockchain Local]
    Detalle On-Chain y Off-Chain
    graph TD
    subgraph Fuera_de_la_Blockchain
        A[Organizador] -->|Prepara Lista| B(Wallets autorizadas)
        C[Asistente] -->|Usa| D[Script de Reclamo]
    end

    subgraph Dentro_de_la_Blockchain
        B -->|Sube datos| E{Contrato Solidity}
        D -->|Llama función| E
        E -->|Crea| F[Certificado NFT]
    end
    Justificación Técnica (Capas)
Dividimos el trabajo en tres partes para que sea ordenado:

Capa de Aplicación: Donde el organizador y el alumno interactúan con el contrato usando Hardhat.

Capa de Red: Usamos el nodo local de Hardhat. Es genial porque es rápido y nos deja ver los errores al instante.

Capa de Activos: Los certificados son tokens ERC-721. Esto asegura que cada uno sea único y que nadie pueda copiar el de otro.

Seguridad y Confianza
No se puede borrar: Una vez que el certificado está en la red local, ahí se queda para siempre.

Es fácil de revisar: Cualquiera puede ver el contrato y confirmar que el certificado es legítimo.

Control total: Solo nosotros (como dueños del contrato) podemos autorizar gente. Nadie puede "colarse" y sacar un certificado si no está en la lista.
