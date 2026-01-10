from django import forms
from django.forms.widgets import Input
from django.core.exceptions import ValidationError


class MultipleFileInput(Input):
    """Widget personnalisé pour permettre l'upload de plusieurs fichiers"""
    input_type = 'file'
    template_name = 'django/forms/widgets/file.html'
    needs_multipart_form = True
    
    def __init__(self, attrs=None):
        default_attrs = {'multiple': True}
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)
    
    def format_value(self, value):
        """Cette méthode est appelée mais nous retournons None car c'est un input file"""
        return None
    
    def value_from_datadict(self, data, files, name):
        """Retourner une liste de fichiers depuis request.FILES"""
        if hasattr(files, 'getlist'):
            file_list = files.getlist(name)
            # Retourner la liste si elle contient des fichiers, sinon None
            return file_list if file_list else None
        return files.get(name) if name in files else None


class MultipleFileField(forms.FileField):
    """Champ personnalisé pour accepter plusieurs fichiers"""
    widget = MultipleFileInput
    
    def clean(self, data, initial=None):
        # data peut être une liste, un seul fichier, ou None
        if not data:
            if self.required:
                raise ValidationError(self.error_messages['required'], code='required')
            return []
        
        # Si c'est une liste, valider que ce sont bien des fichiers
        if isinstance(data, list):
            if self.required and len(data) == 0:
                raise ValidationError(self.error_messages['required'], code='required')
            # Valider chaque fichier
            for file_obj in data:
                if not hasattr(file_obj, 'read'):
                    raise ValidationError('Un ou plusieurs fichiers invalides.')
            return data
        
        # Si c'est un seul fichier, le mettre dans une liste
        if hasattr(data, 'read'):
            return [data]
        
        return []


class CsvImportForm(forms.Form):
    csv_file = forms.FileField(
        label='Fichier CSV',
        help_text='Format attendu: NOMS, Catégories, Description courte, Description, PRIX, IMAGES'
    )
    download_images = forms.BooleanField(
        required=False,
        initial=False,
        label='Télécharger les images immédiatement',
        help_text='Si coché, les images seront téléchargées lors de l\'import. Sinon, vous pourrez les télécharger plus tard via le bouton "Importer images".'
    )


class ImageImportForm(forms.Form):
    images = MultipleFileField(
        widget=MultipleFileInput(attrs={'accept': 'image/*'}),
        label='Sélectionner les images',
        help_text='Sélectionnez une ou plusieurs images à uploader. Les images seront associées aux produits selon leur nom (qui doit correspondre au champ IMAGES du CSV).',
        required=True
    )
