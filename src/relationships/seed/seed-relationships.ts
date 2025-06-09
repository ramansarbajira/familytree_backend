import { Injectable } from '@nestjs/common';
import { RelationshipsService } from '../relationships.service';
import { CreateRelationshipDto } from '../dto/create-relationship.dto';
import { CreateTranslationDto } from '../dto/create-translation.dto';

@Injectable()
export class RelationshipSeeder {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  async seed() {
    const relationships: CreateRelationshipDto[] = [
      { key: 'father', description: 'Biological father' },
      { key: 'mother', description: 'Biological mother' },
      { key: 'son', description: 'Biological son' },
      { key: 'daughter', description: 'Biological daughter' },
      { key: 'brother', description: 'Biological brother' },
      { key: 'sister', description: 'Biological sister' },
      { key: 'husband', description: 'Spouse (husband)' },
      { key: 'wife', description: 'Spouse (wife)' },
      { key: 'grandfather', description: 'Paternal grandfather' },
      { key: 'grandmother', description: 'Paternal grandmother' },
    ];

    const translations: { key: string; language: string; label: string }[] = [
      // Father translations
      { key: 'father', language: 'en', label: 'Father' },
      { key: 'father', language: 'ta', label: 'அப்பா' },
      { key: 'father', language: 'hi', label: 'पिता' },
      { key: 'father', language: 'ma', label: 'പിതാവ്' },
      { key: 'father', language: 'ka', label: 'ತಂದೆ' },

      // Mother translations
      { key: 'mother', language: 'en', label: 'Mother' },
      { key: 'mother', language: 'ta', label: 'அம்மா' },
      { key: 'mother', language: 'hi', label: 'माता' },
      { key: 'mother', language: 'ma', label: 'അമ്മ' },
      { key: 'mother', language: 'ka', label: 'ತಾಯಿ' },

      // Add translations for other relationships similarly...
    ];

    for (const rel of relationships) {
      const created = await this.relationshipsService.createRelationship(rel);

      const relTranslations = translations.filter((t) => t.key === rel.key);
      for (const trans of relTranslations) {
        await this.relationshipsService.addTranslation(created.id, {
          language: trans.language,
          label: trans.label,
        } as CreateTranslationDto);
      }
    }
  }
}
