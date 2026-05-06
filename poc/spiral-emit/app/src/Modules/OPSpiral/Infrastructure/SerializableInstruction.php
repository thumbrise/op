<?php

declare(strict_types=1);

namespace App\Modules\OPSpiral\Infrastructure;

use JsonSerializable;
use Symfony\Component\Yaml\Yaml;
use Thumbrise\OP\Universal\Schema\Instruction;

class SerializableInstruction extends Instruction implements JsonSerializable
{
    public function __toString(): string
    {
        return $this->toYaml();
    }

    public function toYaml(): string
    {
        return Yaml::dump($this->toAssoc(), flags: Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE | Yaml::DUMP_EXCEPTION_ON_INVALID_TYPE | Yaml::DUMP_OBJECT_AS_MAP);
    }

    public function jsonSerialize(): array
    {
        return $this->toAssoc();
    }

    private function toAssoc(): array
    {
        $vars = get_object_vars($this);

        $json = json_encode($vars);

        $assoc = json_decode($json, true);

        return $this->recursiveNullFilter($assoc);
    }

    private function recursiveNullFilter(array $data): array
    {
        $filtered = [];
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $value = $this->recursiveNullFilter($value);
            }
            if (null !== $value) {
                $filtered[$key] = $value;
            }
        }

        return $filtered;
    }
}
