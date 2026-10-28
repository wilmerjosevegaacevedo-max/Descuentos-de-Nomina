"""
Diccionario unificado para instanciar clientes automáticamente.
"""
from .cdf import ClienteCDF
from .continental import ClienteContinental
from .dxc import ClienteDXC

CLIENT_MAP = {
    "cdf": ClienteCDF,
    "continental": ClienteContinental,
    "dxc": ClienteDXC
}

__all__ = ["CLIENT_MAP"]
